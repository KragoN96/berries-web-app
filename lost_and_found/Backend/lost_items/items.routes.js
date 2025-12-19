const express = require("express");
const { ObjectId } = require("mongodb");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const USERS_COLLECTION = "users_info";
const ITEMS_COLLECTION = "items";
const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;






router.get("/", async (req, res) => {
  try {
    const db = req.db;
    if (!db) return res.status(503).json({ message: "DB not ready" });

    const { type, location, limit = 20, cursor } = req.query;

    const query = {
      expiresAt: { $gt: new Date() },
    };

    // 🔹 filtru LOST / FOUND
    if (type) query.type = type;

    // 🔹 FILTRU LOCAȚIE (nou)
    if (location) {
      query.locationText = { $regex: location, $options: "i" };
    }

    // 🔹 cursor = "<createdAtISO>|<id>"
    if (cursor) {
      const [createdAtStr, id] = String(cursor).split("|");
      const createdAt = new Date(createdAtStr);

      query.$or = [
        { createdAt: { $lt: createdAt } },
        { createdAt: createdAt, _id: { $lt: new ObjectId(id) } },
      ];
    }

    const lim = Math.min(parseInt(limit, 10) || 20, 50);

    const items = await db
      .collection(ITEMS_COLLECTION)
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(lim)
      .toArray();

    const nextCursor =
      items.length === lim
        ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1]._id}`
        : null;

    res.json({ items, nextCursor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// 🔹 CREATE ITEM
router.post("/", requireAuth, async (req, res) => {
  try {
    const db = req.db;
    if (!db) return res.status(503).json({ message: "DB not ready" });

    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      description,
      type,
      locationText,
      whereToClaim,
      dateHappened,
      images,
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["lost", "found"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + DAYS_30_MS);

    let authorName = "Anonim";
try {
  const u = await db.collection(USERS_COLLECTION).findOne(
    { _id: new ObjectId(String(userId)) },
    { projection: { name: 1, fullName: 1, username: 1, email: 1 } }
  );

  authorName =
    u?.name || u?.fullName || u?.username || u?.email || "Anonim";
} catch (e) {
  authorName = "Anonim";
}

    const item = {
      title: String(title).trim(),
      description: String(description).trim(),
      type,
      locationText: locationText ? String(locationText).trim() : "",
      whereToClaim: whereToClaim ? String(whereToClaim).trim() : "",
      dateHappened: dateHappened ? new Date(dateHappened) : null,

      images: Array.isArray(images) ? images.map((url) => ({ url })) : [],

      createdBy: String(userId),
      createdAt: now,
      updatedAt: now,
      expiresAt,
      authorName,
      comments: [],
    };

    const result = await db.collection(ITEMS_COLLECTION).insertOne(item);
    res.status(201).json({ ...item, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// 🔹 ITEM DETAILS + creator name
router.get("/:id", async (req, res) => {
  try {
    const db = req.db;
    if (!db) return res.status(503).json({ message: "DB not ready" });

    const item = await db
      .collection(ITEMS_COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!item) return res.status(404).json({ message: "Item not found" });

   let creator = null;

// 1️⃣ încearcă ca ObjectId
try {
  creator = await db.collection(USERS_COLLECTION).findOne(
    { _id: new ObjectId(item.createdBy) },
    { projection: { name: 1, fullName: 1, username: 1, email: 1 } }
  );
} catch (e) {
  creator = null;
}

// 2️⃣ fallback: încearcă ca STRING (FOARTE IMPORTANT)
if (!creator) {
  creator = await db.collection(USERS_COLLECTION).findOne(
    { _id: String(item.createdBy) },
    { projection: { name: 1, fullName: 1, username: 1, email: 1 } }
  );
}


    if (creator) {
      const displayName =
        creator.name ||
        creator.fullName ||
        creator.username ||
        creator.email ||
        "Anonim";

      item.createdBy = {
        _id: creator._id,
        name: displayName,
        email: creator.email,
      };

      // ✅ FOARTE IMPORTANT
      item.authorName = displayName;
    }

    // ✅ fallback absolut
    if (!item.authorName) {
      item.authorName = "Anonim";
    }
if (Array.isArray(item.comments)) {
  item.comments = item.comments.map((c) => ({
    ...c,
    authorName: c.authorName || "Anonim",
  }));
}
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// 🔹 ADD COMMENT
router.post("/:id/comments",requireAuth, async (req, res) => {
  try {
    const db = req.db;
    if (!db) return res.status(503).json({ message: "DB not ready" });

    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { text } = req.body;
    if (!text || String(text).trim().length < 2) {
      return res.status(400).json({ message: "Comment too short" });
    }

    let u = null;

// 1) încearcă ca ObjectId
try {
  u = await db.collection(USERS_COLLECTION).findOne(
    { _id: new ObjectId(String(userId)) },
    { projection: { name: 1, fullName: 1, username: 1, email: 1 } }
  );
} catch (e) {
  u = null;
}

// 2) fallback ca string
if (!u) {
  u = await db.collection(USERS_COLLECTION).findOne(
    { _id: String(userId) },
    { projection: { name: 1, fullName: 1, username: 1, email: 1 } }
  );
}

const authorName =
  u?.name || u?.fullName || u?.username || u?.email || "Anonim";

const comment = {
  _id: new ObjectId(),
  userId: String(userId),
  authorName,               // ✅ ADĂUGAT
  text: String(text).trim().slice(0, 400),
  createdAt: new Date(),
};


    const result = await db.collection(ITEMS_COLLECTION).updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { comments: comment },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔹 DELETE COMMENT
router.delete("/:itemId/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const db = req.db;
    if (!db) return res.status(503).json({ message: "DB not ready" });

    const userId = String(req.user?.id || req.user?._id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { itemId, commentId } = req.params;

    const item = await db.collection(ITEMS_COLLECTION).findOne({
      _id: new ObjectId(itemId),
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    const comment = item.comments?.find(
      (c) => String(c._id) === String(commentId)
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (String(comment.userId) !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db.collection(ITEMS_COLLECTION).updateOne(
      { _id: new ObjectId(itemId) },
      { $pull: { comments: { _id: new ObjectId(commentId) } } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 EDIT COMMENT
router.patch("/:itemId/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const db = req.db;
    if (!db) return res.status(503).json({ message: "DB not ready" });

    const userId = String(req.user?.id || req.user?._id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { itemId, commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length < 2) {
      return res.status(400).json({ message: "Text too short" });
    }

    const item = await db.collection(ITEMS_COLLECTION).findOne({
      _id: new ObjectId(itemId),
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    const comment = item.comments?.find(
      (c) => String(c._id) === String(commentId)
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (String(comment.userId) !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db.collection(ITEMS_COLLECTION).updateOne(
      { _id: new ObjectId(itemId), "comments._id": new ObjectId(commentId) },
      {
        $set: {
          "comments.$.text": text.trim(),
          "comments.$.editedAt": new Date(),
        },
      }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
