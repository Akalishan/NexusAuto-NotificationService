import Notification from "../models/Notification.js";
import { io } from "../socket.js";

//Send new notification
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !message)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const notification = new Notification({ userId, title, message });
    await notification.save();

    const socketId = global.connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("notification", notification);
      notification.status = "sent";
      await notification.save();
    }

    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }); // newest first
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
