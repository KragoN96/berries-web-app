const express = require("express");
const multer = require("multer");
const cloudinary = require("./cloudinary");
const requireAuth = require("./middleware/requireAuth");

const router = express.Router();

// multer în memorie (nu scriem fișiere pe disc)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB / imagine
});

// helper: upload buffer -> cloudinary
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 1400, crop: "limit" }], // optimizează un pic
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/uploads  (protejat)
router.post("/", requireAuth, upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const folder = "lostandfound/items";

    const uploaded = [];
    for (const f of req.files) {
      const r = await uploadBufferToCloudinary(f.buffer, folder);
      uploaded.push({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
      });
    }

    res.status(201).json({ images: uploaded });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
res.status(500).json({ message: "Upload failed", error: err.message });

  }
});

module.exports = router;
