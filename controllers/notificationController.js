import Notification from "../models/Notification.js";
import { io } from "../socket.js";

//Send new notification
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, recipientType } = req.body;
    if (!userId || !message || !recipientType)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const notification = new Notification({ userId, title, message, recipientType });
    await notification.save();

     const key = `${recipientType}-${userId}`;
    const socketId = global.connectedUsers.get(key);
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
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    }); // newest first
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: `${result.nModified} notifications marked as read`
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


//delete all messages
export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      message: `${result.deletedCount} notifications deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



