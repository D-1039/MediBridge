const express = require("express");
const authRoutes = require("./authRoutes");
const medicineRoutes = require("./medicineRoutes");
const pharmacistRoutes = require("./pharmacistRoutes");
const requestRoutes = require("./requestRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  const { getOcrHealth } = require("../config/ocr");
  res.json({
    success: true,
    message: "MediBridge API is healthy",
    timestamp: new Date().toISOString(),
    ocr: getOcrHealth(),
  });
});

router.use("/auth", authRoutes);
router.use("/medicines", medicineRoutes);
router.use("/pharmacist", pharmacistRoutes);
router.use("/requests", requestRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
