"use";
// @/components/MessageItem.jsx
import React from "react";
import Image from "next/image";
import { getAvatar } from "@/shared/helper/defaultData";
import { shouldBlurUserPhoto } from "@/shared/helper/shouldBlurUserPhoto";

const MessageItem = ({
  message,
  currentUser,
  selectedMessage,
  setSelectedMessage,
  handleDeleteMessage,
}) => {
  const currentUserId = currentUser.id || currentUser._id;
  const messageSenderId = message.sender._id || message.sender.id;
  const isOwn = messageSenderId === currentUserId;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      key={message._id}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {/* Show sender avatar for received messages */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-2">
          <Image
            width={64}
            height={64}
            src={
              message.sender.profilePicture || getAvatar(message.sender.gender)
            }
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
            className="w-8 h-8 rounded-full object-cover"
            style={{
              filter: shouldBlurUserPhoto(message.sender, currentUser._id)
                ? "blur(8px)"
                : "none",
              transition: "filter 0.3s",
            }}
          />
        </div>
      )}

      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
          isOwn
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          setSelectedMessage(message._id);
        }}
      >
        {/* Show sender name for received messages */}
        {!isOwn && (
          <p className="text-xs font-medium text-gray-600 mb-1">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}

        <p className="text-sm">{message.text}</p>

        <div
          className={`flex items-center justify-end mt-1 space-x-1 ${
            isOwn ? "text-blue-100" : "text-gray-500"
          }`}
        >
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
          )}
        </div>

        {/* Message context menu */}
        {selectedMessage === message._id && isOwn && (
          <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleDeleteMessage(message._id)}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Show current user avatar for sent messages */}
      {isOwn && (
        <div className="flex-shrink-0 ml-2">
          {/* <Image
            width={64}
            height={64}
            src={currentUser.profilePicture || getAvatar(currentUser.gender)}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            className="w-8 h-8 rounded-full object-cover"
          /> */}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
