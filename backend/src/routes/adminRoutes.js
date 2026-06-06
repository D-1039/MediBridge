const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");
const { USER_ROLES } = require("../constants");

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get("/overview", adminController.overview);
router.get("/analytics", adminController.analytics);
router.get("/medicines", adminController.listMedicines);
router.get("/medicines/:id", adminController.medicineDetail);
router.get("/recent/donations", adminController.recentDonations);
router.get("/recent/requests", adminController.recentRequests);

module.exports = router;
