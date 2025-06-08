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
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request photo access"
      );
    }
  }
);

export const approvePhotoAccess = createAsyncThunk(
  "chat/approvePhotoAccess",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/chats/approve-photo/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve photo access"
      );
    }
  }
);

// New async thunk to find or create a conversation
export const findOrCreateConversation = createAsyncThunk(
  "chat/findOrCreateConversation",
  async (userId, { getState, rejectWithValue }) => {
    console.log("userId");
    console.log(userId);
    console.log("userId");

    try {
      const state = getState();
      const existingChat = state.chat.chatList.find((chat) => {
        const participant = chat.participants[0];
        return participant && participant._id === userId;
      });

      if (existingChat) {
        // Chat already exists, return the existing chat ID
        return { chatId: existingChat._id, isNew: false };
      } else {
        // Need to create a new conversation by sending a message or fetching chat
        // For now, we'll just set the active chat and let the message sending create it
        return { chatId: userId, isNew: true };
      }
    } catch (error) {
      return rejectWithValue("Failed to find or create conversation");
    }
  }
);

// Helper function to get current user from localStorage
const getCurrentUser = () => {
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
        const { chatId } = action.payload;
        state.activeChat = chatId;
      })
      .addCase(findOrCreateConversation.rejected, (state, action) => {
        state.loading.findingChat = false;
        state.error.findingChat = action.payload;
      });
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
