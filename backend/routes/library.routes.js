const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const roles = require("../middlewares/role.middleware");
const upload = require("../middlewares/libraryUpload.middleware");
const { createMaterial, getMaterials, deleteMaterial } = require("../controllers/library.controller");

router.get("/materials", auth, getMaterials);
router.post("/materials", auth, roles("admin", "teacher"), upload.single("file"), createMaterial);
router.delete("/materials/:id", auth, roles("admin", "teacher"), deleteMaterial);
module.exports = router;
