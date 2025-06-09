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
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Handle regular chat message
    store.dispatch(addNewMessage(message));

    // Only create notification if current user is the receiver
    if (message.receiver._id === currentUser.id) {
      // If this is a regular message (not photo_request or photo_response)
      if (!message.messageType || message.messageType === "text") {
        const messageNotification = {
          _id: `msg_${message._id}_${Date.now()}`, // Unique ID for notification
          userId: message.receiver._id,
          type: "message",
          fromUserId: message.sender._id,
          content: `${message.sender.firstName}: ${
            message.text.length > 50
              ? message.text.substring(0, 50) + "..."
              : message.text
          }`,
          isRead: false,
          createdAt: message.timestamp,
          messageId: message._id,
        };

        console.log("Creating message notification:", messageNotification);
        store.dispatch(addNotification(messageNotification));
      }

      // If this is a photo_request message, also create a notification
      if (message.messageType === "photo_request") {
        const photoRequestNotification = {
          _id: `photo_req_${message._id}`, // Create unique ID for notification
          userId: message.receiver._id,
          type: "photo_request",
          fromUserId: message.sender._id,
          content: `${message.sender.firstName} has requested access to your profile photos`,
          isRead: false,
          createdAt: message.timestamp,
          messageId: message._id, // Link to the original message
        };

        console.log(
          "Creating photo request notification:",
          photoRequestNotification
        );
        store.dispatch(addNotification(photoRequestNotification));
      }

      // If this is a photo_response message, also create a notification
      if (
        message.messageType === "photo_response" &&
        message.photoResponseData
      ) {
        const response = message.photoResponseData.response;
        const responseText =
          response === "accept"
            ? "approved"
            : response === "deny"
            ? "declined"
            : "will respond later to";

        const photoResponseNotification = {
          _id: `photo_resp_${message._id}`, // Create unique ID for notification
          userId: message.receiver._id,
          type: "photo_response",
          fromUserId: message.sender._id,
          content: `${message.sender.firstName} has ${responseText} your photo access request`,
          isRead: false,
          createdAt: message.timestamp,
          messageId: message._id, // Link to the original message
        };

        console.log(
          "Creating photo response notification:",
          photoResponseNotification
        );
        store.dispatch(addNotification(photoResponseNotification));
      }
    }
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

  // Online status handlers - FIXED
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

  // Notification handlers - FIXED to dispatch to Redux
  socket.on("newNotification", (notification) => {
    console.log("New notification received via socket:", notification);
    // Dispatch directly to Redux store
    store.dispatch(addNotification(notification));
  });

  // Legacy handlers - keeping for backward compatibility but updating to use Redux
  socket.on("photoRequest", (data) => {
    console.log("Photo request received:", data);
    const photoNotification = {
      _id: `photo_legacy_${Date.now()}`,
      userId: data.receiverId || data.userId,
      type: "photo_request",
      fromUserId: data.senderId || data.fromUserId,
      content: data.message || "Photo access request received",
      isRead: false,
      createdAt: data.timestamp || new Date(),
    };
    store.dispatch(addNotification(photoNotification));
  });

  socket.on("photoAccessApproved", (data) => {
    console.log("Photo access approved:", data);
    const approvalNotification = {
      _id: `photo_approval_legacy_${Date.now()}`,
      userId: data.requesterId || data.userId,
      type: "photo_approval",
      fromUserId: data.approverId || data.fromUserId,
      content: data.message || "Photo access approved",
      isRead: false,
      createdAt: data.timestamp || new Date(),
    };
    store.dispatch(addNotification(approvalNotification));
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
