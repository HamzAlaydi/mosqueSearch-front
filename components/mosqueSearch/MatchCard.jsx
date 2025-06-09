// MatchCard.jsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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

const checkPhotoAccess = (targetUser, currentUserId) => {
  // If the target user has no profile picture, no blur needed
  if (!targetUser.profilePicture) {
    return true;
  }

  // If it's the user's own profile
  if (targetUser._id === currentUserId) {
    return true;
  }

  // Check if current user is in the target user's approvedPhotosFor array
  return (
    targetUser.approvedPhotosFor &&
    targetUser.approvedPhotosFor.includes(currentUserId)
  );
};

const MatchCard = ({ match, isListView, onClick, isInterested }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [flagUrl, setFlagUrl] = useState(null);
  const [originFlagUrl, setOriginFlagUrl] = useState(null);
  const currentUserId = getCurrentUser().id;
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
        {console.log()}
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

        <button
          onClick={handleInterestClick}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors z-10"
          aria-label={isInterested ? "Remove interest" : "Add interest"}
        >
          <Heart
            size={18}
            className="text-primary"
            fill={isInterested ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className={`p-4 ${isListView ? "w-2/3" : ""}`}>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {match.firstName || "UnKnown User"} {match.lastName || ""}
          </h3>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin size={14} className="mr-1" />
          <span>{match.distance}</span>
        </div>

        <div className="mb-2 text-sm text-gray-600 space-y-1">
          <p>Age: {match.age}</p>
          <p className="flex items-center">
            Citizenship: {match.citizenship}
            {flagUrl && (
              <img
                src={flagUrl}
                alt={`${match.citizenship} flag`}
                className="w-4 h-4 ml-2 rounded-sm"
              />
            )}
          </p>
          <p className="flex items-center">
            Origin Country: {match.originCountry}
            {originFlagUrl && (
              <img
                src={originFlagUrl}
                alt={`${match.originCountry} flag`}
                className="w-4 h-4 ml-2 rounded-sm"
              />
            )}
          </p>
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Block user");
              }}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Block User"
            >
              <Ban size={18} className="text-gray-700" />
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
    </div>
  );
};

export default MatchCard;
