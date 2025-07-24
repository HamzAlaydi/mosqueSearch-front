"use client";
// @/components/ChatWindow.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
} from "lucide-react";
import MessageItem from "./MessageItem";
import {
  selectMessages,
  selectActiveChat,
  selectOnlineUsers,
  selectTypingUsers,
  selectChatLoading,
  selectChatList,
} from "@/redux/chat/chatSlice";
import { getAvatar } from "@/shared/helper/defaultData";
import { shouldBlurUserPhoto } from "@/shared/helper/shouldBlurUserPhoto";
import EmojiPicker from "emoji-picker-react";
import RequestMessageItem from "./PhotoRequestMessage";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";
// REMOVED: import PhotoRequestMessage from "@/components/chat/PhotoRequestMessage";

const ChatWindow = ({
  currentUser,
  messageText,
  setMessageText,
  handleSendMessage,
  handlePhotoRequest, // This prop is for sending a request, not handling responses within the message display
  showEmojiPicker,
  setShowEmojiPicker,
  messagesEndRef,
  messageInputRef,
  selectedMessage,
  setSelectedMessage,
  handleDeleteMessage,
}) => {
  const dispatch = useDispatch();
  const activeChat = useSelector(selectActiveChat);
  const messages = useSelector((state) => selectMessages(state, activeChat));
  const onlineUsers = useSelector(selectOnlineUsers);
  const typingUsers = useSelector(selectTypingUsers);
  const loading = useSelector(selectChatLoading);
  const chatList = useSelector(selectChatList);
  const [fallbackUserData, setFallbackUserData] = useState(null);

  const activeChatData = chatList.find((chat) => chat._id === activeChat);

  // Get participant data with fallback
  const participant = activeChatData?.participants?.[0] || fallbackUserData;

  const isUserOnline =
    activeChat && participant?._id
      ? onlineUsers.includes(participant._id)
      : false;
  const isUserTyping = typingUsers[activeChat]?.isTyping;

  // Fallback: Fetch user data if not available in chat list
  useEffect(() => {
    const fetchUserData = async () => {
      if (
        activeChat &&
        !activeChatData?.participants?.[0] &&
        !fallbackUserData
      ) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${rootRoute}/users/${activeChat}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userData = response.data;
          setFallbackUserData({
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: userData.profilePicture,
            gender: userData.gender,
            approvedPhotosFor: userData.approvedPhotosFor || [],
          });
        } catch (error) {
          console.error("Failed to fetch user data for chat:", error);
        }
      }
    };

    fetchUserData();
  }, [activeChat, activeChatData, fallbackUserData]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              width={64}
              height={64}
              src={
                participant?.profilePicture || getAvatar(participant?.gender)
              }
              alt={`${participant?.firstName || "User"} ${
                participant?.lastName || ""
              }`.trim()}
              className={`w-8 h-8 rounded-full object-cover ${
                shouldBlurUserPhoto(participant, currentUser.id)
                  ? "blur-sm"
                  : ""
              }`}
            />

            {isUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="font-medium text-gray-900">
              {participant
                ? `${participant.firstName || ""} ${
                    participant.lastName || ""
                  }`.trim() || "User"
                : "Loading..."}
            </h2>
            <p className="text-sm text-gray-500">
              {isUserTyping ? (
                <span className="text-blue-500">Typing...</span>
              ) : isUserOnline ? (
                "Online"
              ) : (
                ""
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Example of a button to send a photo request - keep if needed */}
          {/* <button
            onClick={() => handlePhotoRequest(participant?._id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={!participant?._id}
          >
            <Phone className="w-5 h-5" />{" "}
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button> */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading.messages ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="mb-4">
              {/* Check if it's a request or response message type (e.g., photo_request, wali_request, photo_response, wali_response) */}
              {message.messageType &&
              (message.messageType.endsWith("_request") ||
                message.messageType.endsWith("_response")) ? (
                <RequestMessageItem
                  message={message}
                  currentUserId={currentUser.id}
                  allMessages={messages} // Pass all messages for the component to find associated responses
                  // REMOVED: handleRespondToRequest prop - RequestMessageItem handles its own dispatch
                />
              ) : (
                <MessageItem
                  key={message._id}
                  message={message}
                  currentUser={currentUser}
                  selectedMessage={selectedMessage}
                  setSelectedMessage={setSelectedMessage}
                  handleDeleteMessage={handleDeleteMessage}
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2 relative"
        >
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading.sending}
            />

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiData) =>
                    setMessageText((prev) => prev + emojiData.emoji)
                  }
                  theme="light"
                  height={350}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!messageText.trim() || loading.sending}
            className="p-2 bg-blue-500 text-gray-900 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
