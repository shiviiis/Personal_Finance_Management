import express from "express";
import { exportUserData, importUserData, previewImportData } from "../controller/dataController";
import { isAuthorized } from "../middlewares/AuthMiddleware";

const router = express.Router();

// Export data route
router.get("/export", isAuthorized as any, exportUserData);

// Import data routes
router.post("/import", isAuthorized as any, importUserData);
router.post("/import/preview", isAuthorized as any, previewImportData);

export default router;
