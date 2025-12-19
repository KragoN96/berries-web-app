const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, minlength: 2, maxlength: 400 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: ["lost", "found"], required: true },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // pt Cloudinary (optional)
      },
    ],

    locationText: { type: String, trim: true, maxlength: 200 },
    whereToClaim: { type: String, trim: true, maxlength: 250 },
    dateHappened: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },

    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

itemSchema.index({ type: 1, expiresAt: 1, createdAt: -1 });

module.exports = mongoose.model("Item", itemSchema);
