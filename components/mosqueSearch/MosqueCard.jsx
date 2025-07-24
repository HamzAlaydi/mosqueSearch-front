import Link from "next/link";
import { MapPin, Heart, Calendar, Star, UserPlus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";
import toast from "react-hot-toast";

export default function MosqueCard({ mosque, listView, onClick }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  // Ensure all required fields exist
  const safeMosque = {
    ...mosque,
    prayerTimes: mosque.prayerTimes || {},
    facilities: mosque.facilities || [],
    image: mosque.image || "http://localhost:3001/mosqueSearch",
    rating: mosque.rating || 0,
    reviewCount: mosque.reviewCount || 0,
    address: mosque.address || "Address not available",
  };

  const handleRequestToJoin = async () => {
    if (!requestMessage.trim()) {
      toast.error(
        "Please provide a message explaining why you want to join this mosque"
      );
      return;
    }

    setIsRequesting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/mosque-attachments/request`,
        {
          mosqueId: mosque._id || mosque.id,
          message: requestMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Successfully attached to mosque! Your verification request has been submitted to the imam for review."
      );
      setShowRequestModal(false);
      setRequestMessage("");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow ${
          listView ? "flex flex-row" : ""
        }`}
        onClick={() => onClick(safeMosque)}
      >
        <div className={`relative ${listView ? "w-1/3" : ""}`}>

          <img
            src={safeMosque.image}
            alt={safeMosque.name}
            className={`object-cover ${
              listView ? "w-full h-48" : "w-full h-64"
            }`}
          />
          <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition">
            <Heart className="text-gray-600 hover:text-red-500" size={20} />
          </button>
        </div>
        <div className={`p-4 ${listView ? "w-2/3" : ""}`}>
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{safeMosque.name}</h3>
            <div className="flex items-center text-sm">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="ml-1">{safeMosque.rating}</span>
              {safeMosque.reviewCount > 0 && (
                <span className="text-gray-500 ml-1">
                  ({safeMosque.reviewCount})
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <MapPin size={14} className="mr-1" /> {safeMosque.address}
          </p>
          {safeMosque.distance && (
            <p className="text-sm text-gray-600 mt-1">{safeMosque.distance}</p>
          )}

          {/* Prayer Times Section - Fixed with null check */}
          {safeMosque.prayerTimes &&
            Object.keys(safeMosque.prayerTimes).length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-2">
                  Today's Prayer Times
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(safeMosque.prayerTimes).map(
                    ([prayer, time]) => (
                      <div
                        key={prayer}
                        className="bg-gray-100 px-2 py-1 rounded-md"
                      >
                        <span className="font-medium capitalize">
                          {prayer}:{" "}
                        </span>
                        <span>{time}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Facilities Tags - Fixed with null check */}
          {safeMosque.facilities.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {safeMosque.facilities.slice(0, 3).map((facility) => (
                  <span
                    key={facility}
                    className="text-xs bg-primary bg-opacity-10 text-white px-2 py-1 rounded-full"
                  >
                    {facility}
                  </span>
                ))}
                {safeMosque.facilities.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{safeMosque.facilities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            <button className="text-primary text-sm font-medium hover:underline flex items-center">
              <Calendar size={14} className="mr-1" /> Prayer Times
            </button>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRequestModal(true);
                }}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-1"
              >
                <UserPlus size={14} />
                Request to Join
              </button>
              <Link
                href={`/mosqueSearch/#`}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Request to Join {safeMosque.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You will be immediately attached to this mosque. Please provide a
              message explaining why you want to join. The imam will review your
              verification request.
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Tell us why you want to join this mosque..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={500}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isRequesting}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestToJoin}
                disabled={isRequesting || !requestMessage.trim()}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {isRequesting ? "Submitting..." : "Join Mosque"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
