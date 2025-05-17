"use client";

import { useState, useEffect } from "react";
import { X, Heart, HeartOff, Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserInterests,
  removeInterest,
} from "../../redux/match/matchSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { calculateAge, getAvatar } from "@/shared/helper/defaultData";

export default function InterestsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userInterests, loading } = useSelector((state) => state.matches);
  const [localInterests, setLocalInterests] = useState([]);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUserInterests());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    setLocalInterests(userInterests);
  }, [userInterests]);

  const handleViewProfile = (userId) => {
    onClose();
    router.push(`/profile/${userId}`);
  };

  const handleRemoveInterest = async (interestId) => {
    setActionLoading(interestId);
    try {
      await dispatch(removeInterest(interestId)).unwrap();
      // Update local state immediately after successful removal
      setLocalInterests((prev) =>
        prev.filter((item) => item._id !== interestId)
      );
    } catch (error) {
      console.error("Failed to remove interest:", error);
    } finally {
      setActionLoading("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center">
            <Heart size={20} className="text-red-500 mr-2" />
            Your Interests
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : localInterests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Heart size={48} className="text-gray-300 mb-4" />
              <p className="text-lg text-gray-500">
                You haven't added any interests yet
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Browse matches and click the heart icon to add them to your
                interests
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {localInterests.map((interest, index) => (
                <div
                  key={interest._id || index}
                  className="border border-gray-200 rounded-lg p-4 flex items-center bg-white"
                >
                  <div className="h-16 w-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                    {interest?.profilePicture ? (
                      <Image
                        src={
                          interest.profilePicture?.startsWith("http")
                            ? interest.profilePicture
                            : getAvatar(interest.gender)
                        }
                        alt={`${interest?.firstName || "User"}'s profile`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={getAvatar(interest.gender)}
                        alt={`${interest?.firstName || "User"}'s profile`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-medium">
                      {`${interest?.firstName || "Unknown"} ${
                        interest?.lastName || ""
                      }`.trim()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {interest?.birthDate
                        ? `${calculateAge(interest?.birthDate)} years`
                        : "Age not provided"}
                      {interest?.currentLocation?.address &&
                        ` • ${interest.currentLocation.address}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(interest?._id)}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleRemoveInterest(interest._id)}
                      disabled={actionLoading === interest._id}
                      className="p-2 text-red-500 rounded-full hover:bg-red-50 transition"
                    >
                      {actionLoading === interest._id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <HeartOff size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
