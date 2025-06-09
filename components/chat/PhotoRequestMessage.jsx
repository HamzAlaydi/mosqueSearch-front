// @/components/chat/RequestMessageItem.jsx
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  respondToPhotoRequest,
  respondToWaliRequest,
} from "../../redux/chat/chatSlice";
import { Check, X, Clock, Camera, Users } from "lucide-react";
import { toast } from "react-hot-toast";

const MESSAGE_TYPE_MAP = {
  photo_request: {
    responseType: "photo_response",
    responseDataKey: "photoResponseData",
    requestText: "📸 Photo request sent",
    responseTextPrefix: "Photo", // Changed to just "Photo"
    icon: Camera,
    requestTitle: "Photo Access",
    requestMessage: (senderName) =>
      `${senderName} is requesting access to your photos.`,
    requestColors: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-500",
      iconText: "text-white",
      senderInitialBg: "bg-blue-100",
      senderInitialText: "text-blue-600",
      text: "text-gray-700",
    },
    responseColors: {
      accept: "bg-green-50 border-green-200 text-green-800",
      deny: "bg-red-50 border-red-200 text-red-800",
      later: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
  },
  wali_request: {
    responseType: "wali_response",
    responseDataKey: "waliResponseData",
    requestText: "🤝 Wali request sent",
    responseTextPrefix: "Wali", // Changed to just "Wali"
    icon: Users,
    requestTitle: "Wali Access",
    requestMessage: (senderName) =>
      `${senderName} is requesting your wali details.`,
    requestColors: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-500",
      iconText: "text-white",
      senderInitialBg: "bg-purple-100",
      senderInitialText: "text-purple-600",
      text: "text-gray-700",
    },
    responseColors: {
      accept: "bg-green-50 border-green-200 text-green-800",
      deny: "bg-red-50 border-red-200 text-red-800",
      later: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
  },
};

const RequestMessageItem = ({ message, currentUserId, allMessages = [] }) => {
  const dispatch = useDispatch();
  const [responding, setResponding] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  const isRequestMessage = message.messageType.endsWith("_request");
  const isResponseMessage = message.messageType.endsWith("_response");

  const messageConfig = MESSAGE_TYPE_MAP[message.messageType] || {};

  const isReceiver = message.receiver && message.receiver._id === currentUserId;
  const isSender = message.sender && message.sender._id === currentUserId;

  useEffect(() => {
    if (isRequestMessage && isReceiver) {
      const expectedResponseType = message.messageType.replace(
        "_request",
        "_response"
      );
      const responseDataKey =
        MESSAGE_TYPE_MAP[message.messageType]?.responseDataKey;

      if (expectedResponseType && responseDataKey) {
        const foundResponseMessage = allMessages.some(
          (msg) =>
            msg.messageType === expectedResponseType &&
            msg[responseDataKey]?.originalMessageId === message._id &&
            msg[responseDataKey]?.responderId === currentUserId
        );
        setHasResponded(foundResponseMessage);
      }
    }
  }, [allMessages, message, isReceiver, isRequestMessage, currentUserId]);

  const handleResponse = async (responseType) => {
    try {
      setResponding(true);
      if (message.messageType === "photo_request") {
        await dispatch(
          respondToPhotoRequest({
            requesterId: message.sender._id,
            response: responseType,
            originalMessageId: message._id,
          })
        ).unwrap();
      } else if (message.messageType === "wali_request") {
        await dispatch(
          respondToWaliRequest({
            requesterId: message.sender._id,
            response: responseType,
            originalMessageId: message._id,
          })
        ).unwrap();
      }

      setHasResponded(true);
      toast.success(
        `${messageConfig.requestTitle} request ${
          responseType === "accept"
            ? "accepted"
            : responseType === "deny"
            ? "declined"
            : "deferred"
        }`
      );
    } catch (error) {
      console.error(
        `Failed to respond to ${messageConfig.requestTitle} request:`,
        error
      );
      toast.error(`Failed to respond to ${messageConfig.requestTitle} request`);
    } finally {
      setResponding(false);
    }
  };

  const alreadyResponded = hasResponded;
  const SenderIcon = messageConfig.icon;

  // --- RENDERING LOGIC ---

  // 1. Render for an **incoming request** that hasn't been responded to (Receiver's view)
  if (isRequestMessage && isReceiver && !alreadyResponded) {
    const { requestColors, requestTitle, requestMessage } = messageConfig;

    return (
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${requestColors.bg} ${requestColors.border} ml-0 mr-auto shadow-sm`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full ${requestColors.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {SenderIcon && (
              <SenderIcon size={16} className={requestColors.iconText} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-7 h-7 rounded-full ${requestColors.senderInitialBg} flex items-center justify-center`}
              >
                <span
                  className={`${requestColors.senderInitialText} text-sm font-semibold`}
                >
                  {message.sender.firstName?.[0] || "U"}
                </span>
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {message.sender.firstName} {message.sender.lastName}
              </span>
            </div>
            <p className={`text-sm ${requestColors.text} mb-2 leading-relaxed`}>
              {requestMessage(message.sender.firstName || "User")}
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
            How would you like to respond to the {requestTitle} request?
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

  // 2. Render for an **incoming request** that HAS been responded to (Receiver's view)
  if (isRequestMessage && isReceiver && alreadyResponded) {
    const responseExpectedType = message.messageType.replace(
      "_request",
      "_response"
    );
    const responseDataKey =
      MESSAGE_TYPE_MAP[message.messageType]?.responseDataKey;

    const responseMessageData = allMessages.find(
      (msg) =>
        msg.messageType === responseExpectedType &&
        msg[responseDataKey]?.originalMessageId === message._id &&
        msg[responseDataKey]?.responderId === currentUserId
    )?.[responseDataKey];

    const responseType = responseMessageData?.response;
    const responseText =
      responseType === "accept"
        ? "Accepted"
        : responseType === "deny"
        ? "Declined"
        : responseType === "later"
        ? "Deferred"
        : "Responded"; // Fallback for general 'responded' status

    const responseColorClass =
      messageConfig.responseColors?.[responseType] ||
      "text-gray-600 bg-gray-50 border-gray-200";

    return (
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 ml-0 mr-auto`}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {SenderIcon && <SenderIcon size={14} className="text-gray-500" />}
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
            <p className="text-sm text-gray-700 mb-2">
              {messageConfig.requestMessage(message.sender.firstName || "User")}
            </p>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium mb-2 ${responseColorClass}`}
            >
              {responseType === "accept" && <Check size={10} />}
              {responseType === "deny" && <X size={10} />}
              {responseType === "later" && <Clock size={10} />}
              {/* Display "Photo Responded" or "Wali Responded" */}
              {messageConfig.responseTextPrefix} {responseText}
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

  // 3. Render for **response messages** (notifications to the original requester - i.e., current user is the receiver of the response)
  if (isResponseMessage && isReceiver) {
    const originalRequestTypeKey = message.messageType.replace(
      "_response",
      "_request"
    );
    const originalRequestConfig =
      MESSAGE_TYPE_MAP[originalRequestTypeKey] || {};

    const responseDataKey = originalRequestConfig.responseDataKey;
    const responseType = message[responseDataKey]?.response;
    const responseTextPrefix = originalRequestConfig.responseTextPrefix;

    const responseIcon =
      responseType === "accept" ? "✅" : responseType === "deny" ? "❌" : "⏰";

    const responseColorClass =
      originalRequestConfig.responseColors?.[responseType] ||
      "bg-yellow-50 border-yellow-200 text-yellow-800";

    return (
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg border-2 ml-0 mr-auto shadow-sm ${responseColorClass}`}
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
            <p className="text-sm font-medium mb-1">
              {responseTextPrefix} {responseType || "response"}: {message.text}
            </p>
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

  // 4. Default render for sent requests (by the current user) or other message types
  const messageClass = isSender
    ? "max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-primary text-white ml-auto mr-0"
    : "max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800 ml-0 mr-auto";

  const suffixText =
    isRequestMessage && isSender
      ? messageConfig.requestText
      : isResponseMessage
      ? `${
          MESSAGE_TYPE_MAP[message.messageType.replace("_response", "_request")]
            ?.responseTextPrefix || "Access"
        } ${
          message[
            MESSAGE_TYPE_MAP[
              message.messageType.replace("_response", "_request")
            ]?.responseDataKey
          ]?.response || "response"
        }`
      : null;

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
            {suffixText && (
              <span className="ml-2 text-xs opacity-75">{suffixText}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestMessageItem;
