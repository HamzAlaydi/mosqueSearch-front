"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Menu,
  User,
  Sliders,
  Heart,
  MessageCircle,
  Info,
  Bell,
} from "lucide-react";
import InterestsModal from "./mosqueSearch/InterestsModal";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/auth/authSlice";
import { useRouter } from "next/navigation";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";
import { io } from "socket.io-client";
import { initializeSocket } from "@/shared/services/socketService";
import {
  fetchNotifications,
  markAsRead,
} from "@/redux/notification/notificationSlice";

export function HeaderNotifications() {
  // Local state for UI toggles
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const router = useRouter();
  // Select user and notification data from Redux store
  const { currentUser } = useSelector((state) => state.user); // Assuming 'user' slice for currentUser
  const {
    items: notifications, // Renaming for clarity, these are from Redux
    unreadCount,
    status: notificationStatus, // To handle loading/error states if needed
  } = useSelector((state) => state.notifications); // Assuming 'notifications' slice

  const dispatch = useDispatch();
  // const router = useRouter(); // Uncomment if navigation is needed via router

  // Handle opening/closing interests modal
  const handleOpenInterests = () => setIsInterestsModalOpen(true);
  const handleCloseInterests = () => setIsInterestsModalOpen(false);

  useEffect(() => {
    if (currentUser?._id) {
      // Dispatch thunk to fetch initial notifications
      dispatch(fetchNotifications());

      // Initialize socket connection (idempotent)
      const currentSocket = initializeSocket();
    }
  }, [currentUser, dispatch]);

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    if (secondsAgo < 60) return "just now";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  const handleNotificationClick = async (notification) => {
    // Mark notification as read using Redux thunk if it's unread
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }

    setShowNotificationsMenu(false); // Close dropdown

    // Handle different notification types
    if (notification.type === "interest") {
      if (notification.fromUserId) {
        router.push(`/profile/${notification.fromUserId}`); // <--- Navigate to the profile of the user who showed interest
      } else {
        console.warn(
          "Interest notification is missing fromUserId, cannot navigate to profile."
        );
        // Fallback behavior if fromUserId is missing, e.g., open the generic interests modal or do nothing
        // handleOpenInterests(); // You might still call this or remove it
      }
    } else if (notification.type === "message") {
      router.push("/messages"); // <--- Use router for consistency
    } else if (
      notification.type?.includes("verification") ||
      notification.type?.includes("photoAccess")
    ) {
      router.push("/profile"); // <--- Use router for consistency (navigates to current user's profile)
    }
    // Consider if other notification types need specific routing or actions.
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length > 0) {
      // Dispatch markAsRead for each unread notification.
      // The Redux state will update, and unreadCount will decrement.
      unreadNotifications.forEach((notification) => {
        dispatch(markAsRead(notification._id));
      });
      // Consider adding a backend endpoint for "mark all as read" for better performance with many notifications.
      // If such an endpoint exists, create a new thunk for it.
    }
  };

  return (
    <>
      <div className="relative">
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
          aria-label="Toggle notifications menu"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotificationsMenu && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-primary hover:text-primary-dark" // Ensure 'primary' and 'primary-dark' are defined in your Tailwind config
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationStatus === "loading" && (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              )}
              {notificationStatus === "succeeded" && notifications.length > 0
                ? notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? "bg-blue-50" : "" // Example: highlight unread
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleNotificationClick(notification)
                      } // Accessibility
                    >
                      <div className="flex gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            notification.type === "interest"
                              ? "bg-red-100 text-red-500"
                              : notification.type === "message"
                              ? "bg-blue-100 text-blue-500"
                              : "bg-green-100 text-green-500" // Default icon style
                          }`}
                        >
                          {notification.type === "interest" ? (
                            <Heart size={16} />
                          ) : notification.type === "message" ? (
                            <MessageCircle size={16} />
                          ) : (
                            <User size={16} /> // Default icon
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full self-center"></div> // Unread indicator
                        )}
                      </div>
                    </div>
                  ))
                : notificationStatus === "succeeded" &&
                  notifications.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No notifications yet
                    </div>
                  )}
              {notificationStatus === "failed" && (
                <div className="p-6 text-center text-red-500">
                  Failed to load notifications.
                </div>
              )}
            </div>

            {notifications.length > 5 && ( // Or a more meaningful condition
              <div className="p-3 text-center border-t border-gray-100">
                <Link
                  href="/notifications" // Link to a page with all notifications
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <InterestsModal
        isOpen={isInterestsModalOpen}
        onClose={handleCloseInterests}
      />
    </>
  );
}
