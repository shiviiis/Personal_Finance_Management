import express from "express";
import { exportUserData, importUserData, previewImportData } from "../controller/dataController";
import { isAuthorized } from "../middlewares/AuthMiddleware";

const router = express.Router();

// Export data route
router.get("/export", isAuthorized, exportUserData);

// Import data routes
router.post("/import", isAuthorized, importUserData);
router.post("/import/preview", isAuthorized, previewImportData);

export default router;
