import express from "express";
import {
  sendNotification,
  getNotifications,
  deleteNotification,
  markAllAsRead,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// Create a new notification
router.post("/", sendNotification);

// Get all notifications for a user
router.get("/:userId", getNotifications);

// Delete a specific notification
router.delete("/:id", deleteNotification);

//mark all notifications as read for a user
router.put("/mark-all-read/:userId", markAllAsRead);

// Delete all notifications for a user
router.delete("/delete-all/:userId", deleteAllNotifications);

export default router;
