"use client";
import { useState, useEffect } from "react";
import "./AvatarUpload.css";

const AvatarUpload = ({ field, form, preview, blurPhotoForEveryone }) => {
  const [previewUrl, setPreviewUrl] = useState(preview || "");

  // Handle initial load and form state changes
  useEffect(() => {
    const initializePreview = async () => {
      if (preview) {
        setPreviewUrl(preview);
      } else if (field.value instanceof File) {
        // Regenerate preview from File object if it exists
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target.result);
          form.setFieldValue("profilePicturePreview", e.target.result);
        };
        reader.readAsDataURL(field.value);
      }
    };

    initializePreview();
  }, [preview, field.value, form]);

  const handleChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match("image/(jpeg|png|gif)")) {
      form.setFieldError(
        field.name,
        "Invalid image format (JPEG, PNG, GIF only)"
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      form.setFieldError(field.name, "Image must be smaller than 5MB");
      return;
    }

    // Update preview and form values
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      form.setFieldValue("profilePicturePreview", e.target.result);
      form.setFieldValue(field.name, file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    form.setFieldValue("profilePicturePreview", "");
    form.setFieldValue(field.name, null);
  };

  return (
    <div className="whatsapp-avatar-upload">
      <div className="avatar-container">
        <div
          className="avatar-preview rounded-full w-24 h-24 relative overflow-hidden mx-auto"
          style={{
            backgroundImage: `url(${
              previewUrl || "/images/default-avatar.jpg"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: blurPhotoForEveryone ? "blur(8px)" : "none",
          }}
        >
          <div className="edit-overlay absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <input
              type="file"
              name={field.name}
              id={field.name}
              accept="image/png, image/jpeg, image/gif"
              onChange={handleChange}
              className="avatar-input hidden"
            />
            <label
              htmlFor={field.name}
              className="edit-button text-white cursor-pointer"
            >
              <i className="fas fa-camera text-xl"></i>
            </label>
          </div>
        </div>
      </div>

      <div className="upload-instructions text-center mt-2">
        <p className="text-sm text-gray-600">Tap to change profile photo</p>
        {field.value?.name && (
          <p className="file-name text-xs text-gray-500">{field.value.name}</p>
        )}
      </div>

      {previewUrl && (
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 text-sm hover:text-red-700"
          >
            Remove Photo
          </button>
        </div>
      )}

      {form.errors[field.name] && (
        <div className="error-message text-red-500 text-sm text-center mt-1">
          {form.errors[field.name]}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
