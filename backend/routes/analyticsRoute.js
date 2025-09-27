import express from "express";
import {
  trackUserAction,
  getAnalytics,
  getAnalyticsSummary,
} from "../controllers/analyticsController.js";
import adminAuth from "../middleware/adminAuth.js";

const analyticsRouter = express.Router();

// Public route for tracking user actions
analyticsRouter.post("/track", trackUserAction);

// Admin only routes for viewing analytics
analyticsRouter.get("/data", adminAuth, getAnalytics);
analyticsRouter.get("/summary", adminAuth, getAnalyticsSummary);

export default analyticsRouter;
