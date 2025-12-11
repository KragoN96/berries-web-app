const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// --- Stripe Donations Route --- //
const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/api/create-checkout-session", async (req, res) => {
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Donation" },
            unit_amount: amount * 100, // în cenți
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});





// server.js - Backend server for IP tracking

const { MongoClient } = require('mongodb');
const https = require('https');


const PORT = 5000;

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'ip_location';
const COLLECTION_NAME = 'users_info';

let db;

// Middleware
app.use(cors()); // Allow React app to connect


// Connect to MongoDB
MongoClient.connect(MONGO_URI)
  .then((client) => {
    console.log('✓ Connected to MongoDB');
    db = client.db(DB_NAME);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * Fetch IP info from ipinfo.io
 */
function getIPInfo(ip) {
  return new Promise((resolve, reject) => {
    const url = `https://ipinfo.io/${ip}/json`;
    
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Failed to parse IP info'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Extract real IP from request
 * Handles proxies, load balancers, etc.
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         'unknown';
}

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/track-ip
 * Tracks user's IP and saves location to MongoDB
 */
app.get('/api/track-ip', async (req, res) => {
  try {
    // Get user's IP address
    const clientIP = getClientIP(req);
    console.log(`Tracking IP: ${clientIP}`);
    
    // Fetch location data from ipinfo.io
    const ipData = await getIPInfo(clientIP);
    
    // Prepare document for MongoDB
    const locationDoc = {
      ip: ipData.ip,
      hostname: ipData.hostname || null,
      city: ipData.city || null,
      region: ipData.region || null,
      country: ipData.country || null,
      location: ipData.loc || null, // "latitude,longitude"
      organization: ipData.org || null,
      postal: ipData.postal || null,
      timezone: ipData.timezone || null,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || null
    };
    
    // Save to MongoDB
    const collection = db.collection(COLLECTION_NAME);
    await collection.insertOne(locationDoc);
    
    console.log(`✓ Saved location for IP: ${clientIP}`);
    
    // Return data to frontend (without sensitive info)
    res.json({
      success: true,
      data: {
        city: ipData.city,
        region: ipData.region,
        country: ipData.country,
        timezone: ipData.timezone
      }
    });
    
  } catch (error) {
    console.error('Error tracking IP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track IP'
    });
  }
});

/**
 * GET /api/locations
 * Get all tracked locations (for admin dashboard)
 */
app.get('/api/locations', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    const locations = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

/**
 * GET /api/stats
 * Get statistics about tracked IPs
 */
app.get('/api/stats', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    
    const stats = {
      totalVisits: await collection.countDocuments(),
      uniqueIPs: (await collection.distinct('ip')).length,
      countries: await collection.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      cities: await collection.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/track-ip`);
  console.log(`   - GET  http://localhost:${PORT}/api/locations`);
  console.log(`   - GET  http://localhost:${PORT}/api/stats\n`);
});

const bcrypt = require("bcrypt");

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, university } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Câmpuri obligatorii lipsă." });
    }

    const users = db.collection("users_info");

    const normalizedEmail = email.trim().toLowerCase();

    console.log("REGISTER BODY:", { fullName, email: normalizedEmail, university });

    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail deja folosit." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await users.insertOne({
      fullName,
      email: normalizedEmail,   
      passwordHash,             
      university,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User creat cu succes" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Eroare server la înregistrare." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = db.collection("users_info");

    if (!email || !password) {
      return res.status(400).json({ error: "Completează email și parolă." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("LOGIN TRY:", { email: normalizedEmail });

   
    let user = await users.findOne({ email: normalizedEmail });

    
    if (!user) {
      user = await users.findOne({ email }); 
    }

    if (!user) {
      console.log("LOGIN FAIL: user not found");
      return res.status(400).json({ error: "Credențiale incorecte." });
    }

    console.log("LOGIN USER FOUND:", {
      email: user.email,
      hasPasswordHash: !!user.passwordHash,
      hasPlainPassword: !!user.password,
    });

    let isMatch = false;

    if (user.passwordHash) {
      
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password) {
     
      isMatch = password === user.password;
    } else {
      console.log("LOGIN FAIL: user has no password field");
      return res
        .status(500)
        .json({ error: "Configurație parolă invalidă pentru acest user." });
    }

    if (!isMatch) {
      console.log("LOGIN FAIL: wrong password");
      return res.status(400).json({ error: "Credențiale incorecte." });
    }

    console.log("LOGIN SUCCESS for:", user.email);

    res.json({
      message: "Autentificare reușită",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Eroare server la autentificare." });
  }
});
