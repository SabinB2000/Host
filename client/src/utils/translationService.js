import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const translateText = async (text, from, to) => {
  try {
    const response = await axios.post(`${API_URL}/api/translate`, { text, from, to });
    return response.data.translatedText;
  } catch (error) {
    console.error("Translation Error:", error);
    return "Translation failed. Please try again.";
  }
};
    