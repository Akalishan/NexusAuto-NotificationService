import { Server } from "socket.io";
import Notification from "./models/Notification.js";

export let io;
global.connectedUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Step 1: Register user
    socket.on("register", async (data) => {
      const { id, type } = data; // type = "user" or "employee"
      const key = `${type}-${id}`;
      global.connectedUsers.set(key, socket.id);

      console.log(`Registered ${type} ${id} with socket ${socket.id}`);

      // Step 2: Send any pending notifications (in order)
      const pending = await Notification.find({ userId: id, recipientType: type, status: "pending" }).sort({ createdAt: 1 });
      for (const notif of pending) {
        io.to(socket.id).emit("notification", notif);
        notif.status = "sent";
        await notif.save();
      }
    });

    // Step 3: Mark as read
    socket.on("markAsRead", async (notifId) => {
      await Notification.findByIdAndUpdate(notifId, { read: true });
    });

    // Step 4: Delete notification (real-time)
    socket.on("deleteNotification", async (notifId) => {
      await Notification.findByIdAndDelete(notifId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [key, id] of global.connectedUsers.entries()) {
        if (id === socket.id) {
          global.connectedUsers.delete(key);
          break;
        }
      }
    });
  });

  return io;
};
