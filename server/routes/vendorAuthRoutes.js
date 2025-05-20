const express = require("express");
const router  = express.Router();
const { vendorSignup, vendorLogin } = require("../controllers/vendorAuthController");

router.post("/signup", vendorSignup);
router.post("/login",  vendorLogin);

module.exports = router;
