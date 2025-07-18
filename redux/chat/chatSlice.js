// @/redux/chat/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";

// Async thunks
export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat list"
      );
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/chats/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { userId, messages: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, text }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/chats/send`,
        { receiverId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${rootRoute}/chats/${userId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark messages as read"
      );
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${rootRoute}/chats/message/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { messageId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete message"
      );
    }
  }
);

// New async thunk to find or create a conversation
export const findOrCreateConversation = createAsyncThunk(
  "chat/findOrCreateConversation",
  async (userId, { getState, rejectWithValue }) => {
    console.log("Finding or creating conversation for userId:", userId);

    try {
      const state = getState();
      const existingChat = state.chat.chatList.find((chat) => {
        const participant = chat.participants[0];
        return participant && participant._id === userId;
      });

      if (existingChat) {
        // Chat already exists, return the existing chat ID
        console.log("Found existing chat:", existingChat._id);
        return { chatId: existingChat._id, isNew: false };
      } else {
        // For new chats, we need to fetch user information to display in the header
        // We'll create a temporary chat entry with user info
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${rootRoute}/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userData = response.data;
          console.log("Fetched user data for new chat:", userData);

          // Return the userId as chatId and include user data for immediate display
          return {
            chatId: userId,
            isNew: true,
            userData: {
              _id: userData._id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profilePicture: userData.profilePicture,
              gender: userData.gender,
              approvedPhotosFor: userData.approvedPhotosFor || [],
            },
          };
        } catch (userError) {
          console.error("Failed to fetch user data:", userError);
          // If we can't fetch user data, still return the chatId but without user data
          return { chatId: userId, isNew: true };
        }
      }
    } catch (error) {
      console.error("findOrCreateConversation error:", error);
      return rejectWithValue("Failed to find or create conversation");
    }
  }
);

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.error("No user found in localStorage");
      return null;
    }
    const user = JSON.parse(userStr);
    if (!user || !user.id) {
      console.error("Invalid user object in localStorage");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const requestPhotoAccess = createAsyncThunk(
  "chat/requestPhotoAccess",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/chats/request-photo/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data; // Return the message data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request photo access"
      );
    }
  }
);

// Async thunk for responding to photo request
export const respondToPhotoRequest = createAsyncThunk(
  "chat/respondToPhotoRequest",
  async ({ requesterId, response, originalMessageId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiResponse = await axios.post(
        `${rootRoute}/chats/respond-photo/${requesterId}`,
        { response, originalMessageId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Backend returns: { message, data, originalMessageId, responseType, accessGranted }
      return {
        message: apiResponse.data.data, // The new photo_response Chat message
        originalMessageId: apiResponse.data.originalMessageId,
        response: apiResponse.data.responseType,
        accessGranted: apiResponse.data.accessGranted,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to respond to photo request"
      );
    }
  }
);

// --- WALII LOGIC START ---
export const requestWaliAccess = createAsyncThunk(
  "chat/requestWaliAccess",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/chats/request-wali/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data; // Return the new wali request message
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request wali access"
      );
    }
  }
);

export const respondToWaliRequest = createAsyncThunk(
  "chat/respondToWaliRequest",
  async ({ requesterId, response, originalMessageId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiResponse = await axios.post(
        `${rootRoute}/chats/respond-wali/${requesterId}`,
        { response, originalMessageId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Assuming your backend returns similar data for wali response
      return {
        message: apiResponse.data.data, // The new wali_response Chat message
        originalMessageId: apiResponse.data.originalMessageId,
        response: apiResponse.data.responseType,
        accessGranted: apiResponse.data.accessGranted, // If applicable for wali access
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to respond to wali request"
      );
    }
  }
);
// --- WALII LOGIC END ---

const initialState = {
  chatList: [],
  messages: {}, // Object to store messages for each chat { userId: [messages] }
  activeChat: null,
  onlineUsers: [],
  typingUsers: {}, // { userId: { isTyping: bool, userInfo: {} } }
  unreadCounts: {}, // { userId: count }
  loading: {
    chatList: false,
    messages: false,
    sending: false,
    findingChat: false,
  },
  error: {
    chatList: null,
    messages: null,
    sending: null,
    findingChat: null,
  },
  socketConnected: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Socket-related actions
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },

    // Real-time message handling
    addNewMessage: (state, action) => {
      const message = action.payload;
      console.log("Processing new message:", message);

      // Get current user from localStorage
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.error("Current user not found");
        return;
      }

      // Determine which user this chat belongs to
      let otherUserId;
      if (message.sender._id === currentUser.id) {
        // Current user sent the message - chat is with the receiver
        otherUserId = message.receiver._id;
      } else {
        // Other user sent the message - chat is with the sender
        otherUserId = message.sender._id;
      }

      console.log("Current user ID:", currentUser.id);
      console.log("Other user ID:", otherUserId);
      console.log("Message sender ID:", message.sender._id);
      console.log("Message receiver ID:", message.receiver._id);

      // Initialize messages array if it doesn't exist
      if (!state.messages[otherUserId]) {
        state.messages[otherUserId] = [];
      }

      // Check if message already exists to avoid duplicates
      const exists = state.messages[otherUserId].find(
        (msg) => msg._id === message._id
      );

      if (!exists) {
        // Add message to the correct user's message array
        state.messages[otherUserId].push(message);

        // Sort messages by timestamp to ensure correct order
        state.messages[otherUserId].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Update chat list with new message
        const chatIndex = state.chatList.findIndex((chat) => {
          // More robust chat matching - check if the chat involves the other user
          const participant = chat.participants[0];
          return participant && participant._id === otherUserId;
        });

        if (chatIndex !== -1) {
          // Update last message
          state.chatList[chatIndex].lastMessage = {
            _id: message._id,
            sender: message.sender._id,
            receiver: message.receiver._id,
            text: message.text,
            timestamp: message.timestamp,
            isRead: message.isRead,
          };

          // If current user is the receiver and this chat is not active, increment unread count
          if (
            message.receiver._id === currentUser.id &&
            state.activeChat !== otherUserId
          ) {
            state.chatList[chatIndex].unreadCount =
              (state.chatList[chatIndex].unreadCount || 0) + 1;
            state.unreadCounts[otherUserId] =
              (state.unreadCounts[otherUserId] || 0) + 1;
          }

          // Move chat to top of the list
          const updatedChat = state.chatList.splice(chatIndex, 1)[0];
          state.chatList.unshift(updatedChat);
        } else {
          console.warn("Chat not found in chatList for user:", otherUserId);
          // You might want to fetch the chat list again here
        }

        console.log(
          "Message added successfully to chat with user:",
          otherUserId
        );
      } else {
        console.log("Message already exists, skipping");
      }
    },

    // Message read handling
    markChatMessagesAsRead: (state, action) => {
      const { userId, messageIds } = action.payload;

      if (state.messages[userId]) {
        state.messages[userId] = state.messages[userId].map((message) => {
          if (messageIds.includes(message._id)) {
            return { ...message, isRead: true };
          }
          return message;
        });
      }

      // Reset unread count
      const chatIndex = state.chatList.findIndex((chat) => chat._id === userId);
      if (chatIndex !== -1) {
        state.chatList[chatIndex].unreadCount = 0;
      }
      state.unreadCounts[userId] = 0;
    },

    // Message deletion
    removeMessage: (state, action) => {
      const { messageId } = action.payload;

      Object.keys(state.messages).forEach((userId) => {
        state.messages[userId] = state.messages[userId].filter(
          (message) => message._id !== messageId
        );
      });
    },

    // Typing status
    setTypingStatus: (state, action) => {
      const { userId, isTyping, userInfo } = action.payload;

      if (isTyping) {
        state.typingUsers[userId] = { isTyping: true, userInfo };
      } else {
        delete state.typingUsers[userId];
      }
    },

    // Online users
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    updateUserOnlineStatus: (state, action) => {
      const { userId, status, lastSeen } = action.payload;

      if (status === "online") {
        if (!state.onlineUsers.includes(userId)) {
          state.onlineUsers.push(userId);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }

      // Update chat list with online status
      state.chatList.forEach((chat) => {
        if (chat.participants[0]._id === userId) {
          chat.participants[0].isOnline = status === "online";
          chat.participants[0].lastSeen = lastSeen;
        }
      });
    },

    // Active chat management
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;

      // Mark messages as read when opening chat
      if (action.payload && state.unreadCounts[action.payload]) {
        state.unreadCounts[action.payload] = 0;

        const chatIndex = state.chatList.findIndex(
          (chat) => chat._id === action.payload
        );
        if (chatIndex !== -1) {
          state.chatList[chatIndex].unreadCount = 0;
        }
      }
    },

    // Clear errors
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state.error[errorType]) {
        state.error[errorType] = null;
      }
    },

    addPhotoRequestMessage: (state, action) => {
      const { requesterId, receiverId, messageData } = action.payload;
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const otherUserId =
        currentUser.id === requesterId ? receiverId : requesterId;

      if (!state.messages[otherUserId]) {
        state.messages[otherUserId] = [];
      }

      // Check if message already exists
      const exists = state.messages[otherUserId].find(
        (msg) => msg._id === messageData._id
      );

      if (!exists) {
        state.messages[otherUserId].push(messageData);
        state.messages[otherUserId].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }
    },
    addPhotoResponseMessage: (state, action) => {
      const message = action.payload;
      const currentUser = getCurrentUser();
      if (!currentUser || !message || !message.photoResponseData) {
        console.error(
          "Invalid photo response message or current user not found."
        );
        return;
      }

      // Determine the chat ID this message belongs to
      let otherUserId;
      if (message.sender._id === currentUser.id) {
        otherUserId = message.receiver._id;
      } else {
        otherUserId = message.sender._id;
      }

      if (!state.messages[otherUserId]) {
        state.messages[otherUserId] = [];
      }

      // Add the photo_response message itself to the chat
      const responseMessageExists = state.messages[otherUserId].find(
        (msg) => msg._id === message._id
      );
      if (!responseMessageExists) {
        state.messages[otherUserId].push(message);
        state.messages[otherUserId].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }

      // Find and update the original photo_request message
      const originalRequestMessageId =
        message.photoResponseData.originalMessageId;
      if (originalRequestMessageId) {
        const originalRequestMessage = state.messages[otherUserId].find(
          (msg) =>
            msg._id === originalRequestMessageId &&
            msg.messageType === "photo_request"
        );

        if (originalRequestMessage) {
          originalRequestMessage.photoResponseData = {
            ...originalRequestMessage.photoResponseData,
            response: message.photoResponseData.response,
            responderId: message.sender._id,
          };
          originalRequestMessage.status = "responded";
          console.log(
            "Original photo request message updated:",
            originalRequestMessage
          );
        } else {
          console.warn(
            "Original photo request message not found for ID:",
            originalRequestMessageId
          );
        }
      }
    },

    // Reset chat state
    resetChatState: () => initialState,
  },

  extraReducers: (builder) => {
    // Fetch chat list
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.loading.chatList = true;
        state.error.chatList = null;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.loading.chatList = false;
        state.chatList = action.payload;

        // Update unread counts
        action.payload.forEach((chat) => {
          state.unreadCounts[chat._id] = chat.unreadCount || 0;
        });
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.loading.chatList = false;
        state.error.chatList = action.payload;
      });

    // Fetch chat messages
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading.messages = true;
        state.error.messages = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        const { userId, messages } = action.payload;
        // Sort messages by timestamp when fetching
        state.messages[userId] = messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error.messages = action.payload;
      });

    // Send message - Fixed to handle immediate UI update
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        // The message will be added via socket event (addNewMessage)
        // But we can also add it immediately for better UX
        const message = action.payload;
        if (message && message._id) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            const otherUserId = message.receiver._id;

            if (!state.messages[otherUserId]) {
              state.messages[otherUserId] = [];
            }

            const exists = state.messages[otherUserId].find(
              (msg) => msg._id === message._id
            );

            if (!exists) {
              state.messages[otherUserId].push(message);
              state.messages[otherUserId].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
              );
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      });

    // Mark messages as read
    builder.addCase(markMessagesAsRead.fulfilled, (state, action) => {
      const { userId } = action.payload;

      if (state.messages[userId]) {
        state.messages[userId] = state.messages[userId].map((message) => ({
          ...message,
          isRead: true,
        }));
      }

      // Reset unread count
      const chatIndex = state.chatList.findIndex((chat) => chat._id === userId);
      if (chatIndex !== -1) {
        state.chatList[chatIndex].unreadCount = 0;
      }
      state.unreadCounts[userId] = 0;
    });

    // Delete message
    builder.addCase(deleteMessage.fulfilled, (state, action) => {
      const { messageId } = action.payload;

      Object.keys(state.messages).forEach((userId) => {
        state.messages[userId] = state.messages[userId].filter(
          (message) => message._id !== messageId
        );
      });
    });

    // Find or create conversation
    builder
      .addCase(findOrCreateConversation.pending, (state) => {
        state.loading.findingChat = true;
        state.error.findingChat = null;
      })
      .addCase(findOrCreateConversation.fulfilled, (state, action) => {
        state.loading.findingChat = false;
        const { chatId, isNew, userData } = action.payload;
        state.activeChat = chatId;

        // If this is a new chat and we have user data, create a temporary chat entry
        if (isNew && userData) {
          // Create a temporary chat entry for immediate display
          const tempChat = {
            _id: chatId,
            participants: [userData],
            lastMessage: null,
            unreadCount: 0,
            isTemporary: true, // Flag to indicate this is a temporary chat
          };

          // Add to chat list if it doesn't exist
          const existingChatIndex = state.chatList.findIndex(
            (chat) => chat._id === chatId
          );
          if (existingChatIndex === -1) {
            state.chatList.unshift(tempChat);
          }
        }
      })
      .addCase(findOrCreateConversation.rejected, (state, action) => {
        state.loading.findingChat = false;
        state.error.findingChat = action.payload;
      });

    // --- PHOTO ACCESS START ---
    builder
      .addCase(requestPhotoAccess.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(requestPhotoAccess.fulfilled, (state, action) => {
        state.loading.sending = false;
        const message = action.payload;

        if (message && message.receiver && message.sender) {
          const currentUser = getCurrentUser();
          if (!currentUser) return;

          const otherUserId =
            message.receiver._id === currentUser.id
              ? message.sender._id
              : message.receiver._id;

          if (!state.messages[otherUserId]) {
            state.messages[otherUserId] = [];
          }

          const exists = state.messages[otherUserId].find(
            (msg) => msg._id === message._id
          );
          if (!exists) {
            state.messages[otherUserId].push(message);
            state.messages[otherUserId].sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
          }
        }
      })
      .addCase(requestPhotoAccess.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      });

    builder
      .addCase(respondToPhotoRequest.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(respondToPhotoRequest.fulfilled, (state, action) => {
        state.loading.sending = false;
        const { message, originalMessageId, response } = action.payload;
        const currentUser = getCurrentUser();

        if (!currentUser || !message) {
          console.error(
            "respondToPhotoRequest.fulfilled: Invalid payload or current user."
          );
          return;
        }

        // Determine the chat ID this message belongs to
        let otherUserId;
        if (message.sender._id === currentUser.id) {
          otherUserId = message.receiver._id;
        } else {
          otherUserId = message.sender._id;
        }

        if (!state.messages[otherUserId]) {
          state.messages[otherUserId] = [];
        }

        // Add the newly created photo_response message to the chat
        const responseMessageExists = state.messages[otherUserId].find(
          (msg) => msg._id === message._id
        );
        if (!responseMessageExists) {
          state.messages[otherUserId].push(message);
          state.messages[otherUserId].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
        }

        // Find and update the original photo_request message if originalMessageId exists
        if (originalMessageId) {
          const originalRequestMessage = state.messages[otherUserId].find(
            (msg) =>
              msg._id === originalMessageId &&
              msg.messageType === "photo_request"
          );

          if (originalRequestMessage) {
            originalRequestMessage.photoResponseData = {
              ...originalRequestMessage.photoResponseData,
              response: response,
              responderId: currentUser.id,
            };
            originalRequestMessage.status = "responded";
            console.log(
              "Original photo request updated after sending response:",
              originalRequestMessage
            );
          } else {
            console.warn(
              "Original photo request not found in state after sending response:",
              originalMessageId
            );
          }
        }
      })
      .addCase(respondToPhotoRequest.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      });
    // --- PHOTO ACCESS END ---

    // --- WALII ACCESS START ---
    builder
      .addCase(requestWaliAccess.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(requestWaliAccess.fulfilled, (state, action) => {
        state.loading.sending = false;
        const message = action.payload;

        if (message && message.receiver && message.sender) {
          const currentUser = getCurrentUser();
          if (!currentUser) return;

          const otherUserId =
            message.receiver._id === currentUser.id
              ? message.sender._id
              : message.receiver._id;

          if (!state.messages[otherUserId]) {
            state.messages[otherUserId] = [];
          }

          const exists = state.messages[otherUserId].find(
            (msg) => msg._id === message._id
          );
          if (!exists) {
            state.messages[otherUserId].push(message);
            state.messages[otherUserId].sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
          }
        }
      })
      .addCase(requestWaliAccess.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      });

    builder
      .addCase(respondToWaliRequest.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(respondToWaliRequest.fulfilled, (state, action) => {
        state.loading.sending = false;
        const { message, originalMessageId, response } = action.payload;
        const currentUser = getCurrentUser();

        if (!currentUser || !message) {
          console.error(
            "respondToWaliRequest.fulfilled: Invalid payload or current user."
          );
          return;
        }

        let otherUserId;
        if (message.sender._id === currentUser.id) {
          otherUserId = message.receiver._id;
        } else {
          otherUserId = message.sender._id;
        }

        if (!state.messages[otherUserId]) {
          state.messages[otherUserId] = [];
        }

        const responseMessageExists = state.messages[otherUserId].find(
          (msg) => msg._id === message._id
        );
        if (!responseMessageExists) {
          state.messages[otherUserId].push(message);
          state.messages[otherUserId].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
        }

        if (originalMessageId) {
          const originalRequestMessage = state.messages[otherUserId].find(
            (msg) =>
              msg._id === originalMessageId &&
              msg.messageType === "wali_request"
          );

          if (originalRequestMessage) {
            originalRequestMessage.waliResponseData = {
              ...originalRequestMessage.waliResponseData,
              response: response,
              responderId: currentUser.id,
            };
            originalRequestMessage.status = "responded";
          } else {
            console.warn(
              "Original wali request message not found in state after sending response:",
              originalMessageId
            );
          }
        }
      })
      .addCase(respondToWaliRequest.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload;
      });
    // --- WALII ACCESS END ---
  },
});

export const {
  setSocketConnected,
  addNewMessage,
  markChatMessagesAsRead,
  removeMessage,
  setTypingStatus,
  setOnlineUsers,
  updateUserOnlineStatus,
  setActiveChat,
  clearError,
  resetChatState,
  addPhotoRequestMessage,
  addPhotoResponseMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectChatList = (state) => state.chat.chatList;
export const selectMessages = (state, userId) =>
  state.chat.messages[userId] || [];
export const selectActiveChat = (state) => state.chat.activeChat;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectUnreadCounts = (state) => state.chat.unreadCounts;
export const selectTotalUnreadCount = (state) =>
  Object.values(state.chat.unreadCounts).reduce((sum, count) => sum + count, 0);
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatErrors = (state) => state.chat.error;
export const selectSocketConnected = (state) => state.chat.socketConnected;
