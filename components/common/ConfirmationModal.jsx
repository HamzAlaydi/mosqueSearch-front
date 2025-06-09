// components/common/ConfirmationModal.jsx
import React from "react";
import { X } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="!px-4 !py-2 !rounded-md !bg-red-600 !text-white hover:!bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
