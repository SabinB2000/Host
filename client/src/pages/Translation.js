import React, { useState, useEffect } from "react";
import axios from 'axios';
import Tesseract from "tesseract.js";
import { FaExchangeAlt, FaMicrophone, FaPlay, FaStop, FaVolumeUp, FaImage, FaTimes } from "react-icons/fa";
import { IoIosSwap } from "react-icons/io";

import "../styles/Translation.css";

const languages = [
  { code: "en", name: "English" },
  { code: "ne", name: "Nepali" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
];

const commonPhrases = [
  { text: "How are you?" },
  { text: "Where is the nearest hotel?" },
  { text: "What's the price?" },
  { text: "Can you help me?" },
  { text: "Where is the bathroom?" },
  { text: "I need a taxi." },
];

const Translation = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ne");
  const [isListening, setIsListening] = useState(false);
  const [translatedImageText, setTranslatedImageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (inputText.trim() !== "") {
      handleTranslate();
    }
  }, [inputText]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await axios.post("/api/translate", {
        text: inputText,
        from: sourceLang,
        to: targetLang,
      });

      const translated = response.data.translatedText || "Translation failed.";
      setTranslatedText(translated);

      // Auto-play the translation if enabled
      if (autoPlay) {
        handlePlayTranslation(translated);
      }
    } catch (error) {
      console.error("Translation Error:", error);
      setTranslatedText("Translation failed. Try again.");
    }
  };

  const handlePlayTranslation = (text = translatedText) => {
    if (!text.trim()) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    setIsSpeaking(true);

    // Find appropriate voice
    const availableVoices = window.speechSynthesis.getVoices();
    if (targetLang === "ne") {
      const nepaliVoice = availableVoices.find((v) => v.lang.includes("hi") || v.lang.includes("ne"));
      if (nepaliVoice) utterance.voice = nepaliVoice;
    } else {
      const selectedVoice = availableVoices.find((v) => v.lang.includes(targetLang));
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleVoiceInput = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = sourceLang;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      setInputText(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));

    Tesseract.recognize(file, "eng+nep")
      .then(({ data: { text } }) => {
        handleTranslateImageText(text);
      })
      .catch((error) => {
        console.error("OCR Error:", error);
        setTranslatedImageText("OCR failed. Please try another image.");
      });
  };

  const handleTranslateImageText = async (text) => {
    if (!text.trim()) return;

    try {
      const response = await axios.post("/api/translate", {
        text: text,
        from: "auto",
        to: "en",
      });

      const translated = response.data.translatedText || "Translation failed.";
      setTranslatedImageText(translated);
      
      if (autoPlay) {
        handlePlayTranslation(translated);
      }
    } catch (error) {
      console.error("Translation Error:", error);
      setTranslatedImageText("Translation failed. Try again.");
    }
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
    setTranslatedImageText("");
  };

  return (
    <div className="translation-app">
      <div className="background-blur"></div>
      
      <div className="translation-container">
        <h1 className="app-title">
          <IoIosSwap className="title-icon" />
          Language Translator
        </h1>
        
        <div className="language-controls">
          <div className="language-selector">
            <label>From:</label>
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="swap-btn" 
            onClick={() => { 
              setSourceLang(targetLang); 
              setTargetLang(sourceLang); 
            }}
          >
            <FaExchangeAlt size={24} color="#fff" /> 
          </button>
          
          <div className="language-selector">
            <label>To:</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="translation-box">
          <div className="input-section">
            <textarea 
              className="input-text" 
              placeholder="Enter text to translate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              className={`mic-btn ${isListening ? 'active' : ''}`}
              onClick={handleVoiceInput}
            >
              <FaMicrophone />
              {isListening ? ' Listening...' : ''}
            </button>
          </div>
          
          <div className="output-section">
            <textarea 
              className="output-text" 
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
            />
            <div className="output-controls">
              {isSpeaking ? (
                <button className="stop-btn" onClick={handleStopSpeaking}>
                  <FaStop size={24} color="#fff" />
                </button>
              ) : (
                <button className="play-btn" onClick={() => handlePlayTranslation()}>
                  <FaPlay size={24} color="#fff" />
                </button>
              )}
              <div className="auto-play-toggle">
                <label>
                  <input 
                    type="checkbox" 
                    checked={autoPlay}
                    onChange={() => setAutoPlay(!autoPlay)}
                  />
                  <span>Auto Play</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <button className="translate-btn" onClick={handleTranslate}>
          <IoIosSwap /> Translate
        </button>
        
        <div className="common-phrases-section">
          <h3>Common Phrases</h3>
          <div className="phrase-buttons">
            {commonPhrases.map((phrase, index) => (
              <button 
                key={index} 
                className="phrase-btn"
                onClick={() => setInputText(phrase.text)}
              >
                {phrase.text}
              </button>
            ))}
          </div>
        </div>
        
        <div className="image-translation-section">
          <h3>
            <FaImage /> Image Translation
          </h3>
          <label className="image-upload-btn">
            Choose Image
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          
          {selectedImage && (
            <div className="image-result">
              <div className="image-preview">
                <img src={selectedImage} alt="Uploaded content" />
                <button className="close-btn" onClick={handleCloseImage}>
                  <FaTimes />
                </button>
              </div>
              <textarea 
                className="image-translation-text"
                value={translatedImageText}
                readOnly
                placeholder="Image translation will appear here..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Translation;