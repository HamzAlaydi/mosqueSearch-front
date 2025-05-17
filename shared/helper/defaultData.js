import femaleAvatar from "../../public/images/matches/femaleAvatar.jpg";
import maleAvatar from "../../public/images/matches/maleAvatar.jpg";
export const getAvatar = (gender) => {
  if (gender === "female") return femaleAvatar;
  if (gender === "male") return maleAvatar;
  return femaleAvatar; // fallback image path
};

export const calculateAge = (birthDate) => {
  const birthDateObj = new Date(birthDate);
  const today = new Date();

  if (isNaN(birthDateObj.getTime())) return 0;
  if (birthDateObj > today) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};
