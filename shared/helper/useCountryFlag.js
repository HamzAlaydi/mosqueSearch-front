// shared/hooks/useCountryFlag.js
import { useEffect, useState } from "react";
import { FLAG_KEY } from "../constants/backendLink";

const API_KEY = FLAG_KEY;

const useCountryFlag = (country) => {
  const [flagUrl, setFlagUrl] = useState(null);

  useEffect(() => {
    const fetchFlag = async () => {
      if (!country) {
        setFlagUrl(null);
        return;
      }

      const apiUrl = `https://api.api-ninjas.com/v1/countryflag?country=${country}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            "X-Api-Key": API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFlagUrl(data.square_image_url);
        } else {
          console.error("Failed to fetch flag:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching flag:", error);
      }
    };

    fetchFlag();
  }, [country]);

  return flagUrl;
};

export default useCountryFlag;
