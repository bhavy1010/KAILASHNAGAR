const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const roles = require("../middlewares/role.middleware");
const upload = require("../middlewares/libraryUpload.middleware");
const { createMaterial, createTextbookLink, getMaterials, deleteMaterial } = require("../controllers/library.controller");

router.get("/materials", auth, getMaterials);
router.post("/materials", auth, roles("admin", "teacher"), upload.single("file"), createMaterial);
router.post("/textbooks", auth, roles("admin", "teacher"), upload.single("coverImage"), createTextbookLink);
router.delete("/materials/:id", auth, roles("admin", "teacher"), deleteMaterial);
module.exports = router;
