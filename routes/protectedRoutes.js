const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected resource access granted",
    user: req.user,
  });
});

router.get("/profile", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected resource access granted",
    user: req.user,
  });
});

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Admin privileges are required",
    });
  }
  next();
};

router.get("/admin", adminMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected resource access granted",
    user: req.user,
  });
});

module.exports = router;
