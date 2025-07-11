// Returns true if the user's photo should be blurred for the current viewer
export function shouldBlurUserPhoto(user, currentUserId) {
  if (!user) return false;

  // If user has set blurPhotoForEveryone to false, show photo to everyone
  if (user.blurPhotoForEveryone === false) return false;

  // If user has set blurPhotoForEveryone to true, check approved list
  if (user.blurPhotoForEveryone === true) {
    // Don't blur for the user themselves
    if (user._id === currentUserId) return false;

    // Don't blur for approved users
    if (
      user.approvedPhotosFor &&
      user.approvedPhotosFor.includes(currentUserId)
    )
      return false;

    // Blur for everyone else
    return true;
  }

  // Default behavior (for backward compatibility): blur for everyone except approved users
  if (user._id === currentUserId) return false;
  if (user.approvedPhotosFor && user.approvedPhotosFor.includes(currentUserId))
    return false;
  return true;
} 