"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bell, Heart, MessageCircle, User } from "lucide-react";
import { initSocket } from "@/shared/services/socketService";
import { rootRoute } from "@/shared/constants/backendLink";
import {
  markAsRead,
  fetchNotifications,
} from "@/redux/notification/notificationSlice";

const NotificationSystem = () => {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUser?._id) return;

    dispatch(fetchNotifications());

    const socket = initSocket(currentUser._id);

    return () => {
      socket.disconnect();
    };
  }, [currentUser, dispatch]);

  // Format the timestamp for display
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    if (secondsAgo < 60) return "just now";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      dispatch(markAsRead(notification._id));

      // Close notifications menu
      setShowNotificationsMenu(false);
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch(`${rootRoute}/notifications/${notification._id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      dispatch(fetchNotifications());
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotificationsMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="text-xs text-primary hover:text-primary-dark"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        notification.type === "interest"
                          ? "bg-red-100 text-red-500"
                          : notification.type === "message"
                          ? "bg-blue-100 text-blue-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      {notification.type === "interest" ? (
                        <Heart size={16} />
                      ) : notification.type === "message" ? (
                        <MessageCircle size={16} />
                      ) : (
                        <User size={16} />
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
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No notifications yet
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="p-3 text-center border-t border-gray-100">
              <Link
                href="/notifications"
                className="text-sm text-primary hover:text-primary-dark"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
