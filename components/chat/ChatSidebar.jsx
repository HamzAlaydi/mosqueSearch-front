'use client'

// @/components/ChatSidebar.jsx
import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { Search, Circle } from "lucide-react";
import {
  selectChatList,
  selectOnlineUsers,
  selectUnreadCounts,
  selectChatLoading,
  selectSocketConnected,
} from "@/redux/chat/chatSlice";
import { getAvatar } from "@/shared/helper/defaultData";

const ChatSidebar = ({
  searchTerm,
  setSearchTerm,
  activeChat,
  handleChatSelect,
}) => {
  const chatList = useSelector(selectChatList);
  const onlineUsers = useSelector(selectOnlineUsers);
  const unreadCounts = useSelector(selectUnreadCounts);
  const loading = useSelector(selectChatLoading);
  const socketConnected = useSelector(selectSocketConnected);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredChats = chatList.filter((chat) => {
    const participant = chat.participants[0];
    if (participant) {
      const fullName = `${participant.firstName || ""} ${
        participant.lastName || ""
      }`.trim();
      return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  });

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800 mb-3">Messages</h1>
        <div className="relative">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Connection Status */}
      <div
        className={`px-4 py-2 text-sm flex items-center gap-2 ${
          socketConnected ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        }`}
      >
        <Circle
          className={`w-2 h-2 ${
            socketConnected ? "fill-green-600" : "fill-red-600"
          }`}
        />
        {socketConnected ? "Connected" : "Connecting..."}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading.chatList ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const participant = chat.participants[0];
            const unreadCount = unreadCounts[chat._id] || 0;
            const isActive = activeChat === chat._id;
            const isParticipantOnline = onlineUsers.includes(participant._id);

            const participantFullName = `${participant.firstName || ""} ${
              participant.lastName || ""
            }`.trim();

            return (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat._id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      width={64}
                      height={64}
                      src={
                        participant.profilePicture ||
                        getAvatar(participant.gender)
                      }
                      alt={`${participant.firstName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {isParticipantOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 truncate">
                        {participantFullName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessage?.timestamp &&
                          formatTime(chat.lastMessage.timestamp)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage?.text || "No messages yet"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;