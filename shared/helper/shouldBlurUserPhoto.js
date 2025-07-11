// Returns true if the user's photo should be blurred for the current viewer
export function shouldBlurUserPhoto(user, currentUserId) {
  if (!user) return false;
  if (!user.blurPhotoForEveryone) return false;
  if (user.approvedPhotosFor && user.approvedPhotosFor.includes(currentUserId)) return false;
  return true;
} 