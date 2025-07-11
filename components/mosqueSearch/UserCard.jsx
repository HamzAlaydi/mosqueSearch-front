import React from "react";
import { useSelector } from "react-redux";
import { shouldBlurUserPhoto } from "@/shared/helper/shouldBlurUserPhoto";

export default function UserCard({ user }) {
  const currentUserId = useSelector((state) => state.user.currentUser?._id);
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* User Profile Picture */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={user.profilePicture || "/api/placeholder/100/100"}
              alt={user.name}
              className="w-full h-full object-cover"
              style={{
                filter: shouldBlurUserPhoto(user, currentUserId)
                  ? "blur(8px)"
                  : "none",
                transition: "filter 0.3s",
              }}
            />
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              {user.name}
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  user.role === "male" ? "bg-blue-500" : "bg-pink-500"
                }`}
              ></span>
            </h3>
            <div className="text-sm text-gray-500 mb-1">
              {user.age} years • {user.religiousness}
            </div>
            <div className="text-sm text-gray-600">{user.profession}</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 pb-4">
        <button className="w-full py-2 rounded-full bg-primary text-white hover:bg-opacity-90 transition-colors text-sm">
          View Profile
        </button>
      </div>
    </div>
  );
}
