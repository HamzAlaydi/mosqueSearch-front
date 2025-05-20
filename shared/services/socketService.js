// @/shared/services/socketService.js
import { io } from "socket.io-client";
import { rootRoute } from "@/shared/constants/backendLink";
import { store } from "@/redux/store"; // Ensure this path is correct
import { addNotification } from "@/redux/notification/notificationSlice"; // Ensure this path is correct

let socket = null;

export const initializeSocket = () => {
  if (socket && socket.connected) {
    // console.log("Socket already connected to");
    return socket;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    // console.log("No token found, socket not initialized.");
    return null;
  }

  // If socket exists (e.g., from a previous session but disconnected), disconnect it first
  if (socket) {
    socket.disconnect();
  }

  socket = io(`${rootRoute}`, {
    // Ensure this matches your backend namespace
    auth: { token },
    transports: ["websocket"], // Using only WebSocket
  });

  socket.on("connect", () => {
    console.log("Socket connected successfully to namespace");
    // The backend should automatically add user to their room based on socket.userId from token
  });

  socket.on("connect_error", (err) => {
    console.error(
      "Socket connection error to namespace:",
      err.message,
      err.data
    );
    // Optional: attempt to re-authenticate or handle error
  });

  socket.on("newNotification", (notification) => {
    console.log("New notification received via socket:", notification);
    store.dispatch(addNotification(notification)); // This updates Redux state
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected from namespace:", reason);
    // Optional: clean up or attempt to reconnect based on the reason
    if (reason === "io server disconnect") {
      // The server explicitly disconnected the socket
      socket.connect(); // Or handle as per your app's logic
    }
    // socket = null; // Consider if you want to nullify here or let initializeSocket handle recreation
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket from namespace.");
    socket.disconnect();
    socket = null;
  }
};
