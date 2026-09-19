import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Globe,
  Lightbulb,
  ListChecks,
  Volume2,
  Pause,
  Play,
  Square
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const MAX_CHARACTERS = 10000;

const languageOptions = [
  {
    value: "en",
    label: "English",
    speechCode: "en-IN"
  },
  {
    value: "te",
    label: "తెలుగు",
    speechCode: "te-IN"
  },
  {
    value: "hi",
    label: "हिन्दी",
    speechCode: "hi-IN"
  }
];

function TextAnalyzer({ onBack }) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("en");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [voices, setVoices] = useState([]);
  const [speechStatus, setSpeechStatus] =
    useState("idle");

  const speechTimeoutRef = useRef(null);

  /*
   * =======================================================
   * LOAD BROWSER SPEECH VOICES
   * =======================================================
   */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const loadVoices = () => {
      const availableVoices =
        window.speechSynthesis.getVoices();

      setVoices(availableVoices);
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;

      window.speechSynthesis.cancel();

      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  /*
   * =======================================================
   * CLEAN UP SPEECH WHEN PAGE CHANGES
   * =======================================================
   */

  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * =======================================================
   * LANGUAGE CHANGE
   * =======================================================
   */

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;

    setLanguage(newLanguage);

    setResult(null);

    setError("");

    stopSpeaking();
  };

  /*
   * =======================================================
   * ANALYZE TEXT
   * =======================================================
   */

  const analyzeText = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError(
        "Please enter some text before analyzing."
      );
      return;
    }

    if (trimmedContent.length > MAX_CHARACTERS) {
      setError(
        `Please keep your text within ${MAX_CHARACTERS.toLocaleString()} characters.`
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    stopSpeaking();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/accessibility/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: trimmedContent,
            language
          })
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to analyze the text."
        );
      }

      const analysisResult =
        data?.data || data?.result;

      if (!analysisResult) {
        throw new Error(
          "The server did not return an analysis result."
        );
      }

      setResult({
        simpleExplanation:
          analysisResult.simpleExplanation ||
          "",

        steps: Array.isArray(
          analysisResult.steps
        )
          ? analysisResult.steps
          : [],

        requirements: Array.isArray(
          analysisResult.requirements
        )
          ? analysisResult.requirements
          : [],

        importantPoints: Array.isArray(
          analysisResult.importantPoints
        )
          ? analysisResult.importantPoints
          : [],

        accessibilityTips: Array.isArray(
          analysisResult.accessibilityTips
        )
          ? analysisResult.accessibilityTips
          : []
      });
    } catch (err) {
      console.error(
        "Text analysis error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while analyzing the text. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =======================================================
   * SELECTED LANGUAGE
   * =======================================================
   */

  const getSelectedLanguage = () => {
    return (
      languageOptions.find(
        (item) => item.value === language
      ) || languageOptions[0]
    );
  };

  /*
   * =======================================================
   * FIND SUITABLE BROWSER VOICE
   * =======================================================
   */

  const findVoice = (speechCode) => {
    if (!voices.length) {
      return null;
    }

    const exactMatch = voices.find(
      (voice) =>
        voice.lang.toLowerCase() ===
        speechCode.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    const languagePrefix =
      speechCode.split("-")[0].toLowerCase();

    const languageMatch = voices.find(
      (voice) =>
        voice.lang
          .toLowerCase()
          .startsWith(languagePrefix)
    );

    return languageMatch || null;
  };

  /*
   * =======================================================
   * SPEAK TEXT
   * =======================================================
   */

  const speakText = (text) => {
    if (!text) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      setError(
        "Text-to-speech is not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const selectedLanguage =
      getSelectedLanguage();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      selectedLanguage.speechCode;

    const voice = findVoice(
      selectedLanguage.speechCode
    );

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeechStatus("playing");
      setError("");
    };

    utterance.onend = () => {
      setSpeechStatus("idle");
    };

    utterance.onerror = (event) => {
      setSpeechStatus("idle");

      if (
        event.error === "canceled" ||
        event.error === "interrupted"
      ) {
        return;
      }

      setError(
        "Unable to play the selected language using your browser's speech service."
      );
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  /*
   * =======================================================
   * LISTEN TO COMPLETE RESULT
   * =======================================================
   */

  const listenToResult = () => {
    if (!result) {
      return;
    }

    const textParts = [];

    if (result.simpleExplanation) {
      textParts.push(
        result.simpleExplanation
      );
    }

    if (result.steps.length) {
      textParts.push(
        "Steps. " +
          result.steps.join(". ")
      );
    }

    if (result.requirements.length) {
      textParts.push(
        "Required information. " +
          result.requirements.join(". ")
      );
    }

    if (result.importantPoints.length) {
      textParts.push(
        "Important points. " +
          result.importantPoints.join(". ")
      );
    }

    if (result.accessibilityTips.length) {
      textParts.push(
        "Accessibility tips. " +
          result.accessibilityTips.join(". ")
      );
    }

    speakText(textParts.join(". "));
  };

  /*
   * =======================================================
   * PAUSE SPEECH
   * =======================================================
   */

  const pauseSpeaking = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();

      setSpeechStatus("paused");
    }
  };

  /*
   * =======================================================
   * RESUME SPEECH
   * =======================================================
   */

  const resumeSpeaking = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();

      setSpeechStatus("playing");
    }
  };

  /*
   * =======================================================
   * STOP SPEECH
   * =======================================================
   */

  const stopSpeaking = () => {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setSpeechStatus("idle");

    setError("");

    if (speechTimeoutRef.current) {
      clearTimeout(
        speechTimeoutRef.current
      );

      speechTimeoutRef.current = null;
    }
  };

  /*
   * =======================================================
   * TEXT INPUT
   * =======================================================
   */

  const handleContentChange = (event) => {
    const value = event.target.value;

    if (value.length <= MAX_CHARACTERS) {
      setContent(value);

      setError("");

      if (result) {
        setResult(null);
      }
    }
  };

  const characterCount = content.length;

  const isOverLimit =
    characterCount > MAX_CHARACTERS;

  /*
   * =======================================================
   * UI
   * =======================================================
   */

  return (
    <main
      className="analyzer-page"
      aria-labelledby="text-analyzer-title"
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="analyzer-header">

        <button
          className="back-button"
          onClick={onBack}
          type="button"
          aria-label="Go back to home"
        >
          <ArrowLeft
            size={20}
            aria-hidden="true"
          />
          <span>Back</span>
        </button>

        <div className="analyzer-title">

          <div
            className="analyzer-icon"
            aria-hidden="true"
          >
            <FileText size={26} />
          </div>

          <div>
            <h1 id="text-analyzer-title">
              Text Analyzer
            </h1>

            <p>
              Transform difficult text into
              simple, accessible information.
            </p>
          </div>

        </div>

      </div>

      <div className="analyzer-container">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section
          className="input-card"
          aria-labelledby="text-input-heading"
        >

          <div className="input-card-header">

            <div>
              <h2 id="text-input-heading">
                Enter Your Text
              </h2>

              <p>
                Paste any difficult information,
                instructions, or document text.
              </p>
            </div>

            <div className="language-select-wrapper">

              <Globe
                size={18}
                aria-hidden="true"
              />

              <label
                htmlFor="text-language"
                className="sr-only"
              >
                Select output language
              </label>

              <select
                id="text-language"
                className="language-select"
                value={language}
                onChange={
                  handleLanguageChange
                }
                disabled={loading}
                aria-label="Select output language"
              >
                {languageOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

          <label
            htmlFor="text-content"
            className="sr-only"
          >
            Text to analyze
          </label>

          <textarea
            id="text-content"
            className="text-input"
            value={content}
            onChange={
              handleContentChange
            }
            placeholder="Paste or type your text here..."
            maxLength={MAX_CHARACTERS}
            aria-label="Text to analyze"
            aria-describedby="character-count"
            disabled={loading}
          />

          <div className="input-footer">

            <span
              id="character-count"
              className={`character-count ${
                isOverLimit ? "limit" : ""
              }`}
              aria-live="polite"
            >
              {characterCount.toLocaleString()} /{" "}
              {MAX_CHARACTERS.toLocaleString()}
            </span>

            <button
              className="analyze-button"
              onClick={analyzeText}
              disabled={
                loading ||
                !content.trim() ||
                isOverLimit
              }
              type="button"
              aria-label={
                loading
                  ? "Analyzing text"
                  : "Analyze text"
              }
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span
                    className="button-spinner"
                    aria-hidden="true"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb
                    size={19}
                    aria-hidden="true"
                  />
                  Analyze Text
                </>
              )}
            </button>

          </div>

        </section>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div
            className="error-message"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        {result && (
          <section
            className="results-section"
            aria-labelledby="accessible-result-title"
          >

            <div className="results-header">

              <div>
                <h2 id="accessible-result-title">
                  Your Accessible Result
                </h2>

                <p>
                  The information has been
                  simplified for easier
                  understanding.
                </p>
              </div>

              {/* Speech Controls */}

              <div
                className="speech-controls"
                aria-label="Speech controls"
              >

                <button
                  className="listen-result-button"
                  onClick={
                    listenToResult
                  }
                  type="button"
                  aria-label="Listen to the accessible result"
                >
                  <Volume2
                    size={18}
                    aria-hidden="true"
                  />
                  Listen
                </button>

                {speechStatus ===
                  "playing" && (
                  <button
                    className="speech-control-button"
                    onClick={
                      pauseSpeaking
                    }
                    type="button"
                    aria-label="Pause speech"
                    title="Pause"
                  >
                    <Pause
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {speechStatus ===
                  "paused" && (
                  <button
                    className="speech-control-button"
                    onClick={
                      resumeSpeaking
                    }
                    type="button"
                    aria-label="Resume speech"
                    title="Resume"
                  >
                    <Play
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {speechStatus !==
                  "idle" && (
                  <button
                    className="speech-stop-button"
                    onClick={
                      stopSpeaking
                    }
                    type="button"
                    aria-label="Stop speech"
                    title="Stop"
                  >
                    <Square
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                )}

              </div>

            </div>

            {/* =================================================
                SIMPLE EXPLANATION
            ================================================= */}

            <article
              className="result-card explanation-card"
              aria-labelledby="simple-explanation-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <Lightbulb size={20} />
                </div>

                <h3 id="simple-explanation-title">
                  Simple Explanation
                </h3>

              </div>

              {result.simpleExplanation ? (
                <p>
                  {result.simpleExplanation}
                </p>
              ) : (
                <p className="empty-result">
                  No explanation was returned.
                </p>
              )}

            </article>

            {/* =================================================
                STEP-BY-STEP
            ================================================= */}

            <article
              className="result-card"
              aria-labelledby="steps-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <ListChecks size={20} />
                </div>

                <h3 id="steps-title">
                  Step-by-Step Instructions
                </h3>

              </div>

              {result.steps.length > 0 ? (
                <ol className="steps-list">

                  {result.steps.map(
                    (step, index) => (
                      <li
                        key={`${step}-${index}`}
                        className="step-item"
                      >
                        <span
                          className="step-number"
                          aria-hidden="true"
                        >
                          {index + 1}
                        </span>

                        <span>
                          {step}
                        </span>
                      </li>
                    )
                  )}

                </ol>
              ) : (
                <p className="empty-result">
                  No step-by-step instructions
                  were found.
                </p>
              )}

            </article>

            {/* =================================================
                REQUIREMENTS
            ================================================= */}

            <article
              className="result-card"
              aria-labelledby="requirements-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <CheckCircle size={20} />
                </div>

                <h3 id="requirements-title">
                  Required Documents /
                  Information
                </h3>

              </div>

              {result.requirements.length >
              0 ? (
                <ul className="result-list">

                  {result.requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <li
                        key={`${requirement}-${index}`}
                      >
                        {requirement}
                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="empty-result">
                  No specific requirements
                  were identified.
                </p>
              )}

            </article>

            {/* =================================================
                IMPORTANT POINTS
            ================================================= */}

            <article
              className="result-card"
              aria-labelledby="important-points-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <Lightbulb size={20} />
                </div>

                <h3 id="important-points-title">
                  Important Points
                </h3>

              </div>

              {result.importantPoints.length >
              0 ? (
                <ul className="result-list">

                  {result.importantPoints.map(
                    (
                      point,
                      index
                    ) => (
                      <li
                        key={`${point}-${index}`}
                      >
                        {point}
                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="empty-result">
                  No important points were
                  identified.
                </p>
              )}

            </article>

            {/* =================================================
                ACCESSIBILITY TIPS
            ================================================= */}

            <article
              className="result-card"
              aria-labelledby="accessibility-tips-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <AccessibilityIcon />
                </div>

                <h3 id="accessibility-tips-title">
                  Accessibility Tips
                </h3>

              </div>

              {result.accessibilityTips.length >
              0 ? (
                <ul className="result-list">

                  {result.accessibilityTips.map(
                    (
                      tip,
                      index
                    ) => (
                      <li
                        key={`${tip}-${index}`}
                      >
                        {tip}
                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="empty-result">
                  No additional accessibility
                  tips were identified.
                </p>
              )}

            </article>

          </section>
        )}

      </div>

    </main>
  );
}

/*
 * =========================================================
 * ACCESSIBILITY ICON
 * =========================================================
 */

function AccessibilityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="5"
        r="2"
      />

      <path d="M5 9h14" />

      <path d="M12 7v13" />

      <path d="m8 21 4-7 4 7" />
    </svg>
  );
}

export default TextAnalyzer;
