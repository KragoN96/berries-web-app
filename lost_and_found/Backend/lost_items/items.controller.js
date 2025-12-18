const Item = require("../Item");
const mongoose = require("mongoose");

const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

async function createItem(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      description,
      type,
      locationText,
      whereToClaim,
      dateHappened,
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const expiresAt = new Date(Date.now() + DAYS_30_MS);

    // TEMP: acceptă images ca array de URL-uri în body, până legați upload-ul
    // images: ["https://.../1.jpg", "https://.../2.jpg"]
    const images = Array.isArray(req.body.images)
      ? req.body.images.map((url) => ({ url }))
      : [];

    const item = await Item.create({
      title,
      description,
      type,
      locationText,
      whereToClaim,
      dateHappened: dateHappened ? new Date(dateHappened) : undefined,
      createdBy: userId,
      expiresAt,
      images,
    });

    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getFeed(req, res) {
  try {
    const { type, limit = 20, cursor } = req.query;

    const q = {
      expiresAt: { $gt: new Date() }, // Varianta A: doar ascundem după 30 zile
    };
    if (type) q.type = type;

    // Cursor: "<createdAtISO>|<id>"
    if (cursor) {
      const [createdAtStr, id] = String(cursor).split("|");
      const createdAt = new Date(createdAtStr);

      q.$or = [
        { createdAt: { $lt: createdAt } },
        { createdAt: createdAt, _id: { $lt: new mongoose.Types.ObjectId(id) } },
      ];
    }

    const lim = Math.min(parseInt(limit, 10) || 20, 50);

    const items = await Item.find(q)
      .sort({ createdAt: -1, _id: -1 })
      .limit(lim)
      .select("title description type images locationText whereToClaim createdAt expiresAt comments")
      .lean();

    const nextCursor =
      items.length === lim
        ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1]._id}`
        : null;

    return res.json({ items, nextCursor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getItemById(req, res) {
  try {
    const item = await Item.findById(req.params.id)
      .populate("comments.user", "name email")
      .populate("createdBy", "name email");

    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function addComment(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { text } = req.body;
    if (!text || String(text).trim().length < 2) {
      return res.status(400).json({ message: "Comment too short" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.comments.push({ user: userId, text: String(text).trim() });
    await item.save();

    const newComment = item.comments[item.comments.length - 1];
    return res.status(201).json(newComment);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  createItem,
  getFeed,
  getItemById,
  addComment,
};
