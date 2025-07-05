"use client";
// @/pages/Messages/page.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatList,
  fetchChatMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  requestPhotoAccess,
  approvePhotoAccess,
  setActiveChat,
  selectChatList,
  selectMessages, // Keep selectMessages here or pass it down as prop if needed
  selectActiveChat,
  selectOnlineUsers,
  selectTypingUsers,
  selectUnreadCounts,
  selectChatLoading,
  selectChatErrors,
  selectSocketConnected,
} from "@/redux/chat/chatSlice";
import {
  initializeSocket,
  joinChatRoom,
  leaveChatRoom,
  emitTyping,
  emitMarkMessagesRead,
  checkConnection,
} from "@/shared/services/socketService";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useSearchParams } from "next/navigation";

const Messages = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams(); // Get URL search params
  const [initialChatLoaded, setInitialChatLoaded] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const urlChatId = searchParams.get("chat");

  // Redux selectors
  const activeChat = useSelector(selectActiveChat);
  const loading = useSelector(selectChatLoading);
  const errors = useSelector(selectChatErrors);
  // Get current user from localStorage or Redux auth state
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Initialize socket and fetch data on component mount
  useEffect(() => {
    initializeSocket();
    dispatch(fetchChatList());

    // Check connection periodically
    const connectionCheck = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => {
      clearInterval(connectionCheck);
      if (activeChat) {
        leaveChatRoom(currentUser.id || currentUser._id, activeChat);
      }
    };
  }, [dispatch, activeChat, currentUser.id, currentUser._id]);
  useEffect(() => {
    if (urlChatId && !initialChatLoaded) {
      dispatch(setActiveChat(urlChatId));
      setInitialChatLoaded(true);
    }
  }, [urlChatId, initialChatLoaded, dispatch]);
  // Handle active chat changes
  useEffect(() => {
    if (activeChat) {
      dispatch(fetchChatMessages(activeChat));
      joinChatRoom(currentUser.id || currentUser._id, activeChat);
      emitMarkMessagesRead(activeChat);

      return () => {
        leaveChatRoom(currentUser.id || currentUser._id, activeChat);
      };
    }
  }, [activeChat, dispatch, currentUser.id, currentUser._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [useSelector((state) => selectMessages(state, activeChat))]); // Depend on messages for active chat

  // Handle typing indicator
  useEffect(() => {
    if (!activeChat) return;

    if (messageText.length > 0 && !isTyping) {
      setIsTyping(true);
      emitTyping(activeChat, true);
    } else if (messageText.length === 0 && isTyping) {
      setIsTyping(false);
      emitTyping(activeChat, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTyping(activeChat, false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, isTyping, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat || loading.sending) return;

    const messageData = {
      receiverId: activeChat,
      text: messageText.trim(),
    };

    try {
      await dispatch(sendMessage(messageData)).unwrap();
      setMessageText("");
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleChatSelect = (chatId) => {
    dispatch(setActiveChat(chatId));
    dispatch(markMessagesAsRead(chatId));
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await dispatch(deleteMessage(messageId)).unwrap();
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handlePhotoRequest = async (userId) => {
    try {
      await dispatch(requestPhotoAccess(userId)).unwrap();
    } catch (error) {
      console.error("Failed to request photo access:", error);
    }
  };

  // No need for handlePhotoApproval here if it's not used in the UI for the current user to approve others' requests
  // const handlePhotoApproval = async (userId) => {
  //   try {
  //     await dispatch(approvePhotoAccess(userId)).unwrap();
  //   } catch (error) {
  //     console.error("Failed to approve photo access:", error);
  //   }
  // };

  return (
    <div className="flex h-[90vh] bg-gray-100">
      <ChatSidebar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeChat={activeChat}
        handleChatSelect={handleChatSelect}
      />

      <ChatWindow
        currentUser={currentUser}
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handlePhotoRequest={handlePhotoRequest}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        messagesEndRef={messagesEndRef}
        messageInputRef={messageInputRef}
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        handleDeleteMessage={handleDeleteMessage}
      />

      {/* Click outside handler for message context menu */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
};

export default Messages;
