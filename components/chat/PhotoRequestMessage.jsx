import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { respondToPhotoRequest } from "../../redux/chat/chatSlice";
import { Check, X, Clock, Camera } from "lucide-react";
import { toast } from "react-hot-toast";

const PhotoRequestMessage = ({ message, currentUserId, allMessages = [] }) => {
  const dispatch = useDispatch();
  const [responding, setResponding] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  // Debug logging - remove after fixing
  console.log("PhotoRequestMessage Debug:", {
    messageType: message.messageType,
    messageId: message._id,
    senderId: message.sender._id,
    receiverId: message.receiver?._id,
    currentUserId: currentUserId,
    photoResponseData: message.photoResponseData,
    hasResponded: hasResponded,
  });

  const isPhotoRequest = message.messageType === "photo_request";
  const isPhotoResponse = message.messageType === "photo_response";

  // More robust receiver check
  const isReceiver = message.receiver && message.receiver._id === currentUserId;
  const isSender = message.sender && message.sender._id === currentUserId;

  // Check if this request has already been responded to by looking for response messages
  useEffect(() => {
    if (isPhotoRequest && isReceiver) {
      // Look for a corresponding photo_response message
      const hasResponseMessage = allMessages.some(
        (msg) =>
          msg.messageType === "photo_response" &&
          msg.photoResponseData?.originalRequesterId === message.sender._id &&
          msg.photoResponseData?.responderId === currentUserId
      );

      setHasResponded(hasResponseMessage);
    }
  }, [
    allMessages,
    isPhotoRequest,
    isReceiver,
    message.sender._id,
    currentUserId,
  ]);

  // Check if this request has already been responded to
  const alreadyResponded =
    message.photoResponseData?.response ||
    message.status === "responded" ||
    hasResponded;

  const handleResponse = async (response) => {
    try {
      setResponding(true);
      await dispatch(
        respondToPhotoRequest({
          requesterId: message.sender._id,
          response,
        })
      ).unwrap();

      setHasResponded(true);
      toast.success(
        `Photo request ${
          response === "accept"
            ? "accepted"
            : response === "deny"
            ? "declined"
            : "deferred"
        }`
      );
    } catch (error) {
      console.error("Failed to respond to photo request:", error);
      toast.error("Failed to respond to photo request");
    } finally {
      setResponding(false);
    }
  };

  // Show action buttons for photo requests that haven't been responded to
  if (isPhotoRequest && isReceiver && !alreadyResponded) {
    return (
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-blue-50 border-2 border-blue-200 ml-0 mr-auto shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Camera size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">
                  {message.sender.firstName?.[0] || "U"}
                </span>
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {message.sender.firstName} {message.sender.lastName}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {message.text}
            </p>
            <div className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-600 mb-3 font-medium">
            How would you like to respond?
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleResponse("accept")}
              disabled={responding}
              className="photo-request-btn photo-request-btn-accept flex items-center gap-1 px-3 py-2 bg-primary !text-white rounded-lg text-xs hover:!bg-[darkgreen] disabled:!opacity-50 disabled:!cursor-not-allowed !transition-colors"
            >
              <Check size={12} />
              {responding ? "..." : "Accept"}
            </button>

            <button
              onClick={() => handleResponse("deny")}
              disabled={responding}
              className="photo-request-btn photo-request-btn-deny flex items-center gap-1 px-4 py-2 !bg-red-500 !text-white rounded-lg text-xs font-medium hover:!bg-red-600 disabled:!opacity-50 disabled:!cursor-not-allowed !transition-all duration-200 shadow-sm"
            >
              <X size={12} />
              {responding ? "..." : "Deny"}
            </button>

            <button
              onClick={() => handleResponse("later")}
              disabled={responding}
              className="photo-request-btn photo-request-btn-later flex items-center gap-1 px-4 py-2 !bg-gray-500 !text-white rounded-lg text-xs font-medium hover:!bg-gray-600 disabled:!opacity-50 disabled:!cursor-not-allowed !transition-all duration-200 shadow-sm"
            >
              <Clock size={12} />
              {responding ? "..." : "Later"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show different UI for already responded requests
  if (isPhotoRequest && isReceiver && alreadyResponded) {
    
    const responseType = message.photoResponseData?.response || "responded";
    console.log({message});
    const responseText =
      responseType === "accept"
        ? "Accepted"
        : responseType === "deny"
        ? "Declined"
        : responseType === "later"
        ? "Deferred"
        : "Responded";

    const responseColor =
      responseType === "accept"
        ? "text-green-600 bg-green-50 border-green-200"
        : responseType === "deny"
        ? "text-red-600 bg-red-50 border-red-200"
        : "text-gray-600 bg-gray-50 border-gray-200";

    return (
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 ml-0 mr-auto">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <Camera size={14} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-medium">
                  {message.sender.firstName?.[0] || "U"}
                </span>
              </span>
              <span className="text-sm text-gray-700">
                {message.sender.firstName} {message.sender.lastName}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{message.text}</p>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium mb-2 ${responseColor}`}
            >
              <Check size={10} />
              {responseText}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Photo response messages (the acceptance/decline notifications)
  if (isPhotoResponse) {
    const responseType = message.photoResponseData?.response;
    const isResponseReceiver =
      message.receiver && message.receiver._id === currentUserId;
    const isResponseSender =
      message.sender && message.sender._id === currentUserId;

    if (isResponseReceiver) {
      // This is a response notification received by the original requester
      const responseIcon =
        responseType === "accept"
          ? "✅"
          : responseType === "deny"
          ? "❌"
          : "⏰";

      const responseColor =
        responseType === "accept"
          ? "bg-green-50 border-green-200 text-green-800"
          : responseType === "deny"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-yellow-50 border-yellow-200 text-yellow-800";

      return (
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg border-2 ml-0 mr-auto shadow-sm ${responseColor}`}
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">{responseIcon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {message.sender.firstName?.[0] || "U"}
                  </span>
                </span>
                <span className="text-sm font-semibold">
                  {message.sender.firstName} {message.sender.lastName}
                </span>
              </div>
              <p className="text-sm font-medium mb-1">{message.text}</p>
              <div className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Regular message display for sent requests or other message types
  const messageClass = isSender
    ? "max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-primary text-white ml-auto mr-0"
    : "max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800 ml-0 mr-auto";

  return (
    <div className={messageClass}>
      <div className="flex items-start gap-2">
        {!isSender && (
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-xs font-medium">
              {message.sender.firstName?.[0] || "U"}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm break-words">{message.text}</p>
          <div
            className={`text-xs mt-1 ${
              isSender ? "text-white/70" : "text-gray-500"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isPhotoRequest && isSender && (
              <span className="ml-2 text-xs opacity-75">
                📸 Photo request sent
              </span>
            )}
            {isPhotoResponse && (
              <span className="ml-2 text-xs opacity-75">
                📸 Photo {message.photoResponseData?.response || "response"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoRequestMessage;
