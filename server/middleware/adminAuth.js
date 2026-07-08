const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

const protectAdmin = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin login required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const adminOnly = (req, res, next) => {
  const adminEmail = String(process.env.ADMIN_EMAIL || "").toLowerCase();
  const userEmail = String(req.user?.email || "").toLowerCase();

  const isAdminByRole = req.user?.role === "admin";
  const isAdminByEmail = adminEmail && userEmail === adminEmail;

  if (!isAdminByRole && !isAdminByEmail) {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

module.exports = {
  protectAdmin,
  adminOnly,
};