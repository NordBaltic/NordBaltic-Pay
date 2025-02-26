import express from "express";
import { getContractStats, updateContractParams, executeAdminAction } from "../controllers/smartContractsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔥 FETCH SMART CONTRACT STATISTICS (ADMIN)
router.get("/stats", authMiddleware, getContractStats);

// 🔥 UPDATE SMART CONTRACT SETTINGS (ADMIN)
router.post("/update", authMiddleware, updateContractParams);

// 🔥 EXECUTE ADMIN ACTION (ADMIN)
router.post("/execute", authMiddleware, executeAdminAction);

export default router;
