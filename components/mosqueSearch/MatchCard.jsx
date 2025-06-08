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
} from "../../redux/chat/chatSlice";
import { MapPin, MessageCircle, Heart } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getAvatar, fetchFlagUrl } from "@/shared/helper/defaultData";
import Link from "next/link";

const MatchCard = ({ match, isListView, onClick, isInterested }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [flagUrl, setFlagUrl] = useState(null);
  const [originFlagUrl, setOriginFlagUrl] = useState(null);

  useEffect(() => {
    const loadFlags = async () => {
      const [citizenshipFlag, originFlag] = await Promise.all([
        fetchFlagUrl(match.citizenship),
        fetchFlagUrl(match.originCountry),
      ]);
      setFlagUrl(citizenshipFlag);
      setOriginFlagUrl(originFlag);
    };

    loadFlags();
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

      // First, dispatch the findOrCreateConversation action to ensure chat exists
      const result = await dispatch(
        findOrCreateConversation(match._id)
      ).unwrap();

      console.log("findOrCreateConversation result:", result);

      // Set the active chat with the correct chatId
      dispatch(setActiveChat(result.chatId));

      // Refresh chat list to ensure we have the latest data
      await dispatch(fetchChatList()).unwrap();

      // Navigate to messages page
      router.push("/messages");

      toast.success(`Opening chat with ${match.firstName || "User"}`);
    } catch (error) {
      console.error("Failed to open chat:", error);
      toast.error("Failed to open chat");
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
          }`}
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
            {match.firstName || ""} {match.lastName || ""}
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
          <p>Languages: {match.languages.join(", ")}</p>
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

        <div className="mt-3 flex justify-between">
          <Link href={`/profile/${match._id}`} passHref>
            <button
              className="flex items-center text-primary text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Profile
            </button>
          </Link>
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
  );
};

export default MatchCard;
