import femaleAvatar from "../../public/images/matches/femaleAvatar.jpg";
import maleAvatar from "../../public/images/matches/maleAvatar.jpg";
import { FLAG_KEY } from "../constants/backendLink";
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

export const fetchFlagUrl = async (country) => {
  if (!country) return null;

  const apiKey = FLAG_KEY;
  const apiUrl = `https://api.api-ninjas.com/v1/countryflag?country=${country}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.square_image_url;
    } else {
      console.error("Failed to fetch flag:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching flag:", error);
    return null;
  }
};
