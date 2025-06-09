"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  initializeSocket,
  disconnectSocket,
  getSocket,
  isSocketConnected,
  checkConnection,
} from "@/shared/services/socketService";
import {
  fetchNotifications,
  markAsRead,
} from "@/redux/notification/notificationSlice";

export function HeaderNotifications() {
  // Local state for UI toggles
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [socketStatus, setSocketStatus] = useState(false);
  const router = useRouter();

  // Select user and notification data from Redux store
  const { currentUser } = useSelector((state) => state.user);
  const {
    items: notifications,
    unreadCount,
    status: notificationStatus,
  } = useSelector((state) => state.notifications);

  const dispatch = useDispatch();

  // Handle opening/closing interests modal
  const handleOpenInterests = () => setIsInterestsModalOpen(true);
  const handleCloseInterests = () => setIsInterestsModalOpen(false);

  // Socket connection status checker
  const checkSocketStatus = useCallback(() => {
    const connected = isSocketConnected();
    setSocketStatus(connected);
    if (!connected && currentUser?._id) {
      console.log("Socket disconnected, attempting to reconnect...");
      checkConnection();
    }
  }, [currentUser]);

  // Initialize socket and fetch notifications
  useEffect(() => {
    if (currentUser?._id) {
      console.log(
        "Initializing socket and fetching notifications for user:",
        currentUser._id
      );

      // Dispatch thunk to fetch initial notifications
      dispatch(fetchNotifications());

      // Initialize socket connection
      const socket = initializeSocket();

      if (socket) {
        setSocketStatus(true);

        // Set up socket status listeners
        socket.on("connect", () => {
          console.log("Socket connected in HeaderNotifications");
          setSocketStatus(true);
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected in HeaderNotifications");
          setSocketStatus(false);
        });

        socket.on("connect_error", () => {
          console.log("Socket connection error in HeaderNotifications");
          setSocketStatus(false);
        });
      }

      // Check socket status periodically
      const statusInterval = setInterval(checkSocketStatus, 5000);

      return () => {
        clearInterval(statusInterval);
        // Don't disconnect socket here as it's shared across components
      };
    }
  }, [currentUser?._id, dispatch, checkSocketStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only disconnect if component is truly unmounting and user is logging out
      // Otherwise, keep socket alive for other components
    };
  }, []);

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
        router.push(`/profile/${notification.fromUserId}`);
      } else {
        console.warn(
          "Interest notification is missing fromUserId, cannot navigate to profile."
        );
      }
    } else if (notification.type === "message") {
      if (notification.fromUserId) {
        router.push(`/messages?chat=${notification.fromUserId}`);
      } else {
        router.push("/messages");
      }
    } else if (notification.type === "photo_request") {
      if (notification.fromUserId) {
        router.push(`/messages?chat=${notification.fromUserId}`);
      } else {
        router.push("/messages");
      }
    } else if (notification.type === "photo_response") {
      if (notification.fromUserId) {
        router.push(`/messages?chat=${notification.fromUserId}`);
      } else {
        router.push("/messages");
      }
    } else if (
      notification.type?.includes("verification") ||
      notification.type?.includes("photoAccess")
    ) {
      router.push("/profile");
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length > 0) {
      // Dispatch markAsRead for each unread notification
      unreadNotifications.forEach((notification) => {
        dispatch(markAsRead(notification._id));
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notifications-dropdown")) {
        setShowNotificationsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="relative notifications-dropdown">
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
          aria-label="Toggle notifications menu"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {/* Socket status indicator (optional - remove if not needed) */}
          {process.env.NODE_ENV === "development" && (
            <div
              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                socketStatus ? "bg-green-500" : "bg-red-500"
              }`}
              title={socketStatus ? "Connected" : "Disconnected"}
            />
          )}
        </button>

        {showNotificationsMenu && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-primary hover:text-primary-dark"
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
                ? notifications
                    .slice() // Create a copy to avoid mutating the original array
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    ) // Sort by newest first
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleNotificationClick(notification)
                        }
                      >
                        <div className="flex gap-3">
                          <div
                            className={`p-2 rounded-full flex-shrink-0 ${
                              notification.type === "interest"
                                ? "bg-red-100 text-red-500"
                                : notification.type === "message"
                                ? "bg-blue-100 text-blue-500"
                                : notification.type === "photo_request"
                                ? "bg-purple-100 text-purple-500"
                                : notification.type === "photo_response"
                                ? "bg-green-100 text-green-500"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {notification.type === "interest" ? (
                              <Heart size={16} />
                            ) : notification.type === "message" ? (
                              <MessageCircle size={16} />
                            ) : notification.type === "photo_request" ||
                              notification.type === "photo_response" ? (
                              <User size={16} />
                            ) : (
                              <Info size={16} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 break-words">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full self-center flex-shrink-0" />
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
                  <button
                    onClick={() => dispatch(fetchNotifications())}
                    className="block mt-2 text-sm text-blue-500 hover:text-blue-700"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            {notifications.length > 5 && (
              <div className="p-3 text-center border-t border-gray-100">
                <Link
                  href="/notifications"
                  className="text-sm text-primary hover:text-primary-dark"
                  onClick={() => setShowNotificationsMenu(false)}
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
