// @/shared/services/socketService.js
import { io } from "socket.io-client";
import { rootRoute } from "@/shared/constants/backendLink";
import { store } from "@/redux/store";
import { addNotification } from "@/redux/notification/notificationSlice";
import {
  addNewMessage,
  markChatMessagesAsRead,
  removeMessage,
  setTypingStatus,
  updateUserOnlineStatus,
  setSocketConnected,
  setOnlineUsers,
} from "@/redux/chat/chatSlice";

let socket = null;
let reconnectTimeout = null;
let typingTimeouts = {};

export const initializeSocket = () => {
  if (socket && socket.connected) {
    console.log("Socket already connected");
    return socket;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, socket not initialized.");
    return null;
  }

  // Clean up existing socket
  if (socket) {
    socket.disconnect();
  }

  // Connect to the /api namespace as per your backend
  socket = io(`${rootRoute}`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  // Connection handlers
  socket.on("connect", () => {
    console.log("Socket connected successfully to /api namespace");
    store.dispatch(setSocketConnected(true));

    // Clear any pending reconnection timeouts
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
    store.dispatch(setSocketConnected(false));

    // Attempt manual reconnection after a delay
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(() => {
        console.log("Attempting to reconnect socket...");
        if (socket) {
          socket.connect();
        }
      }, 5000);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    store.dispatch(setSocketConnected(false));

    if (reason === "io server disconnect") {
      // Server disconnected, attempt to reconnect
      socket.connect();
    }
  });

  // Chat message handlers
  socket.on("newMessage", (message) => {
    console.log("New message received via socket:", message);
    console.log(
      "Current user from localStorage:",
      JSON.parse(localStorage.getItem("user") || "{}")
    );
    store.dispatch(addNewMessage(message));
  });

  socket.on("messagesRead", (data) => {
    console.log("Messages marked as read:", data);
    store.dispatch(
      markChatMessagesAsRead({
        userId: data.chatWith,
        messageIds: data.messageIds,
      })
    );
  });

  socket.on("messageDeleted", (data) => {
    console.log("Message deleted:", data);
    store.dispatch(removeMessage({ messageId: data.messageId }));
  });

  // Typing status handlers
  socket.on("userTyping", (data) => {
    console.log("User typing:", data);
    store.dispatch(
      setTypingStatus({
        userId: data.userId,
        isTyping: true,
        userInfo: data.userInfo,
      })
    );

    // Clear typing after 3 seconds if no stop typing event
    if (typingTimeouts[data.userId]) {
      clearTimeout(typingTimeouts[data.userId]);
    }

    typingTimeouts[data.userId] = setTimeout(() => {
      store.dispatch(
        setTypingStatus({
          userId: data.userId,
          isTyping: false,
        })
      );
      delete typingTimeouts[data.userId];
    }, 3000);
  });

  socket.on("userStoppedTyping", (data) => {
    console.log("User stopped typing:", data);
    store.dispatch(
      setTypingStatus({
        userId: data.userId,
        isTyping: false,
      })
    );

    if (typingTimeouts[data.userId]) {
      clearTimeout(typingTimeouts[data.userId]);
      delete typingTimeouts[data.userId];
    }
  });

  // Online status handlers
  socket.on("userOnline", (data) => {
    console.log("User came online:", data);
    store.dispatch(
      updateUserOnlineStatus({
        userId: data.userId,
        status: "online",
        lastSeen: data.lastSeen,
      })
    );
  });

  socket.on("userOffline", (data) => {
    console.log("User went offline:", data);
    store.dispatch(
      updateUserOnlineStatus({
        userId: data.userId,
        status: "offline",
        lastSeen: data.lastSeen,
      })
    );
  });

  socket.on("onlineUsers", (users) => {
    console.log("Online users updated:", users);
    store.dispatch(setOnlineUsers(users));
  });

  // Notification handlers
  socket.on("newNotification", (notification) => {
    console.log("New notification received:", notification);
    store.dispatch(addNotification(notification));
  });

  socket.on("photoRequest", (data) => {
    console.log("Photo request received:", data);
    store.dispatch(
      addNotification({
        id: Date.now(),
        type: "photo_request",
        title: "Photo Access Request",
        message: data.message,
        data: data,
        timestamp: data.timestamp,
        read: false,
      })
    );
  });

  socket.on("photoAccessApproved", (data) => {
    console.log("Photo access approved:", data);
    store.dispatch(
      addNotification({
        id: Date.now(),
        type: "photo_approval",
        title: "Photo Access Approved",
        message: data.message,
        data: data,
        timestamp: data.timestamp,
        read: false,
      })
    );
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket from /api namespace");

    // Clear all typing timeouts
    Object.values(typingTimeouts).forEach((timeout) => clearTimeout(timeout));
    typingTimeouts = {};

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    socket.disconnect();
    socket = null;
    store.dispatch(setSocketConnected(false));
  }
};

// Chat-specific socket methods
export const joinChatRoom = (userId1, userId2) => {
  if (socket && socket.connected) {
    const roomId = [userId1, userId2].sort().join("_");
    socket.emit("joinRoom", roomId);
    console.log(`Joined chat room: ${roomId}`);
  }
};

export const leaveChatRoom = (userId1, userId2) => {
  if (socket && socket.connected) {
    const roomId = [userId1, userId2].sort().join("_");
    socket.emit("leaveRoom", roomId);
    console.log(`Left chat room: ${roomId}`);
  }
};

export const emitTyping = (receiverId, isTyping) => {
  if (socket && socket.connected) {
    socket.emit("typing", { receiverId, isTyping });
  }
};

export const emitMarkMessagesRead = (userId) => {
  if (socket && socket.connected) {
    socket.emit("markMessagesRead", { userId });
  }
};

// Utility functions
export const isSocketConnected = () => {
  return socket && socket.connected;
};

export const getSocketId = () => {
  return socket ? socket.id : null;
};

// Reconnection helpers
export const forceReconnect = () => {
  if (socket) {
    socket.disconnect();
    setTimeout(() => {
      socket.connect();
    }, 1000);
  }
};

export const checkConnection = () => {
  if (!socket || !socket.connected) {
    console.log("Socket not connected, attempting to initialize...");
    initializeSocket();
  }
};
