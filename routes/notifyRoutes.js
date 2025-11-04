import express from "express";
import {
  sendNotification,
  getNotifications,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Create a new notification
router.post("/", sendNotification);

// Get all notifications for a user
router.get("/:userId", getNotifications);

// Delete a specific notification
router.delete("/:id", deleteNotification);

export default router;
