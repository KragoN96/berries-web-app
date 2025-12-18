const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  console.log("AUTH HEADER:", auth);
  console.log("JWT_SECRET exists?", !!process.env.JWT_SECRET);

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: missing Bearer token" });
  }

  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT PAYLOAD:", payload);

    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (e) {
    console.log("JWT VERIFY ERROR:", e.message);
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};
