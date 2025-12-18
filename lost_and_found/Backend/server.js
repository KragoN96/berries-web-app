// server.js - Backend server for IP tracking + auth
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const https = require("https");
const bcrypt = require("bcrypt");
const itemsRoutes = require("./lost_items/items.routes");
const uploadsRoutes = require("./uploads.routes");
const requireAuth = require("./middleware/requireAuth");
const crypto = require("crypto");



const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
require("dotenv").config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "ip_location";

if (!MONGO_URI) {
  console.error("Missing MONGO_URI env var");
  process.exit(1);
}

const TRACKING_COLLECTION = "ip_locations"; // pentru IP tracking
const USERS_COLLECTION = "users_info";      // pentru utilizatori (email + passwordHash)

let db;






// Middleware
const allowedOrigins = [
  "https://berries-app-f9t3l.ondigitalocean.app",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, cb) => {
    // permite și requests fără origin (ex: Postman)
    if (!origin) return cb(null, true);
    return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
  },
}));

app.use(express.json());
app.post("/auth/forgot-password", (req, res) => {
  console.log("HIT /auth/forgot-password", req.body);
  return res.json({ ok: true, where: "server.js", body: req.body });
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/api/items", itemsRoutes);
app.use((req, res, next) => {
  req.db = db;
  next();
});
app.use("/api/uploads", uploadsRoutes);



// Connect to MongoDB
MongoClient.connect(MONGO_URI)
  .then((client) => {
    console.log("✓ Connected to MongoDB");
    db = client.db(DB_NAME);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/**
 * Fetch IP info from ipinfo.io
 */
function getIPInfo(ip) {
  return new Promise((resolve, reject) => {
    const url = `https://ipinfo.io/${ip}/json`;

    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error("Failed to parse IP info"));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Extract real IP from request
 */
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// ============================================
// ROUTES - IP TRACKING
// ============================================

/**
 * GET /api/track-ip
 * Tracks user's IP and saves location to MongoDB
 */
app.get("/api/track-ip", async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    console.log(`Tracking IP: ${clientIP}`);

    const ipData = await getIPInfo(clientIP);

    const locationDoc = {
      ip: ipData.ip,
      hostname: ipData.hostname || null,
      city: ipData.city || null,
      region: ipData.region || null,
      country: ipData.country || null,
      location: ipData.loc || null,
      organization: ipData.org || null,
      postal: ipData.postal || null,
      timezone: ipData.timezone || null,
      timestamp: new Date(),
      userAgent: req.headers["user-agent"] || null,
    };

    const collection = db.collection(TRACKING_COLLECTION);
    await collection.insertOne(locationDoc);

    console.log(`✓ Saved location for IP: ${clientIP}`);

    res.json({
      success: true,
      data: {
        city: ipData.city,
        region: ipData.region,
        country: ipData.country,
        timezone: ipData.timezone,
      },
    });
  } catch (error) {
    console.error("Error tracking IP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to track IP",
    });
  }
});

/**
 * GET /api/locations
 * Get all tracked locations (for admin dashboard)
 */
app.get("/api/locations", async (req, res) => {
  try {
    const collection = db.collection(TRACKING_COLLECTION);
    const locations = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch locations",
    });
  }
});

/**
 * GET /api/stats
 * Get statistics about tracked IPs
 */
app.get("/api/stats", async (req, res) => {
  try {
    const collection = db.collection(TRACKING_COLLECTION);

    const stats = {
      totalVisits: await collection.countDocuments(),
      uniqueIPs: (await collection.distinct("ip")).length,
      countries: await collection
        .aggregate([
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
      cities: await collection
        .aggregate([
          { $group: { _id: "$city", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    });
  }
});

// ============================================
// ROUTES - AUTH
// ============================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, university } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const users = db.collection(USERS_COLLECTION);
    const normalizedEmail = email.trim().toLowerCase();

    console.log("REGISTER BODY:", { fullName, email: normalizedEmail, university });

    console.log("REGISTER: checking existing user...");
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    console.log("REGISTER: hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("REGISTER: inserting user...");
    const result = await users.insertOne({
      fullName,
      email: normalizedEmail,
      passwordHash,
      university,
      createdAt: new Date(),
    });

    console.log("REGISTER INSERTED:", {
      insertedId: result.insertedId,
      db: DB_NAME,
      collection: USERS_COLLECTION,
    });

    return res.status(201).json({ message: "Account created successfully", id: result.insertedId });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Eroare server la înregistrare." });
  }
});

const jwt = require("jsonwebtoken");

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = db.collection(USERS_COLLECTION);

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log("LOGIN TRY:", { email: normalizedEmail });

    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("LOGIN FAIL: user not found");
      return res.status(400).json({ error: "Incorrect email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      console.log("LOGIN FAIL: wrong password");
      return res.status(400).json({ error: "Incorrect email or password." });
    }

    console.log("LOGIN SUCCESS for:", user.email);

    // ✅ JWT token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
  message: "Login successful",
  token,
  user: {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    university: user.university,
  },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Eroare server la autentificare." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const genericMsg = { message: "If this email exists, you'll receive a reset link shortly." };
    if (!email) return res.status(400).json({ message: "Email lipsă." });

    // dacă DB nu e încă setat
    if (!db) return res.status(503).json({ message: "Baza de date nu este conectată." });

    const users = db.collection("users_info");

    // IMPORTANT: în funcție de cum ai salvat userii, poate fi "Email" sau "username"
    const user = await users.findOne({ email });
    if (!user) return res.json(genericMsg);

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await users.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: tokenHash, resetPasswordExpires } }
    );

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

   await sendEmail({
  to: email,
  subject: "Password Reset – Berries Lost & Found",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Password Reset</h2>
      <p>You recently requested to reset your password for your <b>Berries Lost & Found</b> account.</p>

      <p>Please click the link below to set a new password:</p>

      <p>
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 10px 16px;
          background-color: #4ECDC4;
          color: #000;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">
          Reset Password
        </a>
      </p>

      <p>This link will expire in <b>15 minutes</b>.</p>

      <p>If you did not request a password reset, please ignore this email.</p>

      <p style="margin-top: 24px; font-size: 12px; color: #555;">
        — Lost & Found Team
      </p>
    </div>
  `,
});


    return res.json(genericMsg);
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ message: "Eroare server." });
  }
});


// 2) Reset password (setează parola nouă)
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Date lipsă." });
    }

    if (!db) return res.status(503).json({ message: "Baza de date nu este conectată." });

    const users = db.collection("users_info");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // caută user cu token valid + expirare
    const user = await users.findOne({
      email,
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Token invalid sau expirat." });

    // hash parola nouă
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await users.updateOne(
      { _id: user._id },
      {
        $set: { passwordHash: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      }
    );

    return res.json({ message: "Parola a fost schimbată cu succes." });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ message: "Eroare server." });
  }
});
//import { sendEmail } from "./sendEmail.js";

const User = require("./User");
const { sendEmail } = require("./sendEmail");

app.patch("/api/auth/change-email", requireAuth, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const userId = req.user.id;

    if (!newEmail || !password) {
      return res.status(400).json({ error: "Missing fields." });
    }

    const users = db.collection(USERS_COLLECTION);

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 🔐 verificăm parola
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    // 🔁 verificăm dacă emailul există deja
    const emailExists = await users.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // ✅ update email
    await users.updateOne(
      { _id: user._id },
      { $set: { email: normalizedEmail, updatedAt: new Date() } }
    );

    return res.json({
      message: "Email updated successfully",
      email: normalizedEmail,
    });

  } catch (err) {
    console.error("CHANGE EMAIL ERROR:", err);
    res.status(500).json({ error: "Server error." });
  }
});






// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/track-ip`);
  console.log(`   - GET  http://localhost:${PORT}/api/locations`);
  console.log(`   - GET  http://localhost:${PORT}/api/stats`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login\n`);
});
