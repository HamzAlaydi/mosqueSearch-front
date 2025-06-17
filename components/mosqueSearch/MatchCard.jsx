// MatchCard.jsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  addInterest,
  removeInterest,
  addInterestLocal,
  removeInterestLocal,
} from "../../redux/match/matchSlice";
import {
  setActiveChat,
  fetchChatList,
  findOrCreateConversation,
  requestPhotoAccess,
  getCurrentUser,
  requestWaliAccess,
} from "../../redux/chat/chatSlice";
import {
  blockUser,
  unblockUser,
  blockUserLocal,
  unblockUserLocal,
  // fetchBlockedUsers, // Optionally fetch blocked users if not already done globally
} from "../../redux/block/blockSlice";
import {
  MapPin,
  Heart,
  Image as ImageIcon,
  Ban,
  UserCheck,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getAvatar } from "@/shared/helper/defaultData";
import Link from "next/link";
import { countryFlags } from "@/shared/helper/flagsData";
import ConfirmationModal from "../common/ConfirmationModal";

const checkPhotoAccess = (targetUser, currentUserId) => {
  if (!targetUser.profilePicture) {
    return true;
  }
  if (targetUser._id === currentUserId) {
    return true;
  }
  return (
    targetUser.approvedPhotosFor &&
    targetUser.approvedPhotosFor.includes(currentUserId)
  );
};
const extractCountryFromLocation = (location) => {
  if (!location) return null;
  // Split by comma and get the last part (country)
  const parts = location.split(",").map((part) => part.trim());
  const country = parts[parts.length - 1];

  // Map common location names to flag keys
  const countryMap = {
    "Palestinian Territory": "PS",
    Palestine: "PS",
    "Gaza Strip": "PS",
    // Add more mappings as needed
  };

  return countryMap[country] || country;
};
const MatchCard = ({ match, isListView, onClick, isInterested }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [flagUrl, setFlagUrl] = useState(null);
  const [originFlagUrl, setOriginFlagUrl] = useState(null);
  const currentUserId = getCurrentUser().id;
  const [locationFlagUrl, setLocationFlagUrl] = useState(null);

  // State for the confirmation modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const { blockedUsers } = useSelector((state) => state.block);
  const isBlocked = blockedUsers.some((user) => user._id === match._id);
  const hasPhotoAccess = checkPhotoAccess(match, currentUserId);

  useEffect(() => {
    setFlagUrl(countryFlags[match.citizenship]);
    setOriginFlagUrl(countryFlags[match.originCountry]);
  }, [match.citizenship, match.originCountry]);

  const handleInterestClick = async (e) => {
    e.stopPropagation();
    try {
      if (isInterested) {
        dispatch(removeInterestLocal(match._id));
        await dispatch(removeInterest(match._id)).unwrap();
        toast.success("Removed from interests");
      } else {
        dispatch(addInterestLocal(match));
        await dispatch(addInterest(match._id)).unwrap();
        toast.success("Added to interests");
      }
    } catch (error) {
      if (isInterested) {
        dispatch(addInterestLocal(match));
      } else {
        dispatch(removeInterestLocal(match._id));
      }
      toast.error(error.message || "Failed to update interest");
    }
  };

  const handleMessageClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Clicking message for user:", match._id);
      const result = await dispatch(
        findOrCreateConversation(match._id)
      ).unwrap();
      console.log("findOrCreateConversation result:", result);
      dispatch(setActiveChat(result.chatId));
      await dispatch(fetchChatList()).unwrap();
      router.push("/messages");
      toast.success(`Opening chat with ${match.firstName || "User"}`);
    } catch (error) {
      console.error("Failed to open chat:", error);
      toast.error("Failed to open chat");
    }
  };

  const handleRequestPhoto = async (e) => {
    e.stopPropagation();
    try {
      await dispatch(requestPhotoAccess(match._id)).unwrap();
      toast.success(`Photo request sent to ${match.firstName || "User"}`);
    } catch (error) {
      console.error("Failed to request photo access:", error);
      toast.error("Failed to send photo request");
    }
  };

  const handleRequestWali = async (e) => {
    e.stopPropagation();
    try {
      await dispatch(requestWaliAccess(match._id)).unwrap();
      toast.success(`Wali request sent to ${match.firstName || "User"}`);
    } catch (error) {
      console.error("Failed to request wali access:", error);
      toast.error("Failed to send wali request");
    }
  };

  // This function now just opens the modal
  const handleBlockUserClick = (e) => {
    e.stopPropagation();
    setIsBlockModalOpen(true);
  };

  // This function performs the actual block/unblock logic after confirmation
  const confirmBlock = async () => {
    setIsBlockModalOpen(false); // Close the modal
    try {
      if (isBlocked) {
        dispatch(unblockUserLocal(match._id));
        await dispatch(unblockUser(match._id)).unwrap();
        toast.success(`Unblocked ${match.firstName || "User"}`);
      } else {
        dispatch(blockUserLocal(match._id));
        await dispatch(blockUser(match._id)).unwrap();
        toast.success(`Blocked ${match.firstName || "User"}`);
      }
    } catch (error) {
      // Revert local state on error
      if (isBlocked) {
        dispatch(blockUserLocal(match._id));
      } else {
        dispatch(unblockUserLocal(match._id));
      }
      console.error("Failed to update block status:", error);
      toast.error(error.message || "Failed to update block status");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer ${
        isListView ? "flex" : ""
      }`}
      onClick={() => onClick(match)}
    >
      <div
        className={`${
          isListView ? "w-1/3 h-full" : "h-48"
        } relative overflow-hidden`}
      >
        <Image
          src={
            match.profilePicture?.startsWith("http")
              ? match.profilePicture
              : getAvatar(match.gender)
          }
          alt={`${match?.firstName || "User"}'s profile`}
          width={500}
          height={500}
          className={`object-cover ${
            isListView ? "w-full h-full" : "w-full h-48"
          } ${!hasPhotoAccess ? "blur-sm" : ""}`}
        />

        <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
          {flagUrl && (
            <img
              src={flagUrl}
              alt={`${match.citizenship} flag`}
              className="w-5 h-4 rounded-sm"
            />
          )}
        </div>
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleInterestClick}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label={isInterested ? "Remove interest" : "Add interest"}
          >
            <Heart
              size={18}
              className="text-primary"
              fill={isInterested ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <div className={`p-4 ${isListView ? "w-2/3" : ""}`}>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {match.firstName || "UnKnown User"} {match.lastName || ""},{" "}
          <span className="font-normal">{match.age}</span>
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin size={14} className="mr-1" />
          <span>{match.distance}</span>
        </div>

        <div className="mb-2 text-sm text-gray-600 space-y-1">
          <p>
            Languages:{" "}
            {match.languages
              .map((lang) => lang.charAt(0).toUpperCase() + lang.slice(1))
              .join(", ")}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {match.interests?.slice(0, 3).map((interest, index) => (
            <span
              key={index}
              className="bg-gray-100 text-xs text-gray-700 rounded-full px-2 py-1"
            >
              {interest}
            </span>
          ))}
          {match.interests?.length > 3 && (
            <span className="bg-gray-100 text-xs text-gray-700 rounded-full px-2 py-1">
              +{match.interests.length - 3}
            </span>
          )}
        </div>

        <div className="mt-3 flex justify-between items-center">
          <Link href={`/profile/${match._id}`} passHref>
            <button
              className="flex items-center text-primary text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Profile
            </button>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPhoto}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Request Profile Photo"
            >
              <ImageIcon size={18} className="text-gray-700" />
            </button>

            {/* Changed onClick to open the modal */}
            <button
              onClick={handleBlockUserClick}
              className="p-1 rounded-full hover:bg-gray-100"
              title={isBlocked ? "Unblock User" : "Block User"}
            >
              <Ban
                size={18}
                className={isBlocked ? "text-red-500" : "text-gray-700"}
              />
            </button>

            <button
              onClick={handleRequestWali}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Request Wali Info"
            >
              <UserCheck size={18} className="text-gray-700" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Warning");
              }}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Warning"
            >
              <AlertCircle size={18} className="text-red-500" />
            </button>

            <button
              className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary-dark transition-colors"
              onClick={handleMessageClick}
            >
              <MessageCircle size={14} />
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={confirmBlock}
        title={isBlocked ? "Confirm Unblock" : "Confirm Block"}
        message={
          isBlocked
            ? `Are you sure you want to unblock ${
                match.firstName || "this user"
              }?`
            : `Are you sure you want to block ${
                match.firstName || "this user"
              }? Blocking will prevent them from seeing your profile and messaging you, and vice versa.`
        }
        confirmText={isBlocked ? "Unblock" : "Block"}
        cancelText="Cancel"
      />
    </div>
  );
};

export default MatchCard;
