import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Globe,
  Lightbulb,
  ListChecks,
  Upload,
  Volume2,
  Pause,
  Play,
  Square,
  X
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

function PDFAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [voices, setVoices] = useState([]);
  const [speechStatus, setSpeechStatus] =
    useState("idle");

  const fileInputRef = useRef(null);

  /*
   * =======================================================
   * LOAD SPEECH VOICES
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
      setVoices(
        window.speechSynthesis.getVoices()
      );
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;

      window.speechSynthesis.cancel();
    };
  }, []);

  /*
   * =======================================================
   * CLEAN SPEECH ON UNMOUNT
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
    setLanguage(event.target.value);

    setResult(null);
    setError("");

    stopSpeaking();
  };

  /*
   * =======================================================
   * FILE VALIDATION
   * =======================================================
   */

  const validatePDF = (selectedFile) => {
    if (!selectedFile) {
      return "Please select a PDF file.";
    }

    const isPDF =
      selectedFile.type === "application/pdf" ||
      selectedFile.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      return "Only PDF files are supported.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "PDF size must be less than 5 MB.";
    }

    return "";
  };

  /*
   * =======================================================
   * SELECT FILE
   * =======================================================
   */

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const validationError =
      validatePDF(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
      setResult(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    stopSpeaking();
  };

  /*
   * =======================================================
   * REMOVE FILE
   * =======================================================
   */

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");

    stopSpeaking();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
   * =======================================================
   * OPEN FILE SELECTOR
   * =======================================================
   */

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  /*
   * =======================================================
   * ANALYZE PDF
   * =======================================================
   */

  const analyzePDF = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    const validationError =
      validatePDF(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    stopSpeaking();

    try {
      const formData = new FormData();

      formData.append("document", file);
      formData.append("language", language);

      const response = await fetch(
        `${API_BASE_URL}/api/documents/analyze`,
        {
          method: "POST",
          body: formData
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
            "Unable to analyze the PDF."
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
        "PDF analysis error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while analyzing the PDF. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =======================================================
   * LANGUAGE INFORMATION
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
   * FIND SPEECH VOICE
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

    return (
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith(languagePrefix)
      ) || null
    );
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
   * LISTEN TO RESULT
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
   * PAUSE
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
   * RESUME
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
   * STOP
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
  };

  /*
   * =======================================================
   * UI
   * =======================================================
   */

  return (
    <main
      className="analyzer-page"
      aria-labelledby="pdf-analyzer-title"
    >

      {/* HEADER */}

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
            <h1 id="pdf-analyzer-title">
              PDF Analyzer
            </h1>

            <p>
              Upload a PDF and transform complex
              information into simple guidance.
            </p>
          </div>

        </div>

      </div>

      <div className="analyzer-container">

        {/* INPUT CARD */}

        <section
          className="input-card"
          aria-labelledby="pdf-upload-heading"
        >

          <div className="input-card-header">

            <div>
              <h2 id="pdf-upload-heading">
                Upload Your PDF
              </h2>

              <p>
                Upload a PDF document up to
                5 MB for AI-powered analysis.
              </p>
            </div>

            <div
              className="language-select-wrapper"
            >

              <Globe
                size={18}
                aria-hidden="true"
              />

              <label
                htmlFor="pdf-language"
                className="sr-only"
              >
                Select output language
              </label>

              <select
                id="pdf-language"
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

          {/* FILE UPLOAD */}

          {!file ? (
            <div
              className="upload-area"
              onClick={openFileSelector}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  openFileSelector();
                }
              }}
              aria-label="Upload PDF file. Press Enter or Space to choose a PDF."
            >
              <div
                className="upload-icon"
                aria-hidden="true"
              >
                <Upload size={30} />
              </div>

              <h3>
                Choose a PDF file
              </h3>

              <p>
                Click here to browse your
                computer
              </p>

              <span>
                PDF only • Maximum 5 MB
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={
                  handleFileChange
                }
                hidden
                aria-label="Choose a PDF file"
              />
            </div>
          ) : (
            <div
              className="selected-file"
              aria-label={`Selected PDF file: ${file.name}`}
            >

              <div className="selected-file-info">

                <div
                  className="selected-file-icon"
                  aria-hidden="true"
                >
                  <FileText size={26} />
                </div>

                <div>
                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </span>
                </div>

              </div>

              <button
                className="remove-file-button"
                onClick={removeFile}
                type="button"
                aria-label={`Remove selected PDF ${file.name}`}
                title="Remove PDF"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>

            </div>
          )}

          {/* ANALYZE BUTTON */}

          <div className="input-footer">

            <span
              className="character-count"
              aria-live="polite"
            >
              {file
                ? "PDF ready for analysis"
                : "No PDF selected"}
            </span>

            <button
              className="analyze-button"
              onClick={analyzePDF}
              disabled={
                loading || !file
              }
              type="button"
              aria-label={
                loading
                  ? "Analyzing PDF"
                  : "Analyze PDF"
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
                  Analyze PDF
                </>
              )}
            </button>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div
            className="error-message"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* RESULTS */}

        {result && (
          <section
            className="results-section"
            aria-labelledby="pdf-result-title"
          >

            <div className="results-header">

              <div>
                <h2 id="pdf-result-title">
                  Your Accessible Result
                </h2>

                <p>
                  The PDF information has been
                  simplified for easier understanding.
                </p>
              </div>

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

            {/* SIMPLE EXPLANATION */}

            <article
              className="result-card explanation-card"
              aria-labelledby="pdf-simple-explanation-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <Lightbulb size={20} />
                </div>

                <h3 id="pdf-simple-explanation-title">
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

            {/* STEPS */}

            <article
              className="result-card"
              aria-labelledby="pdf-steps-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <ListChecks size={20} />
                </div>

                <h3 id="pdf-steps-title">
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

            {/* REQUIREMENTS */}

            <article
              className="result-card"
              aria-labelledby="pdf-requirements-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <CheckCircle size={20} />
                </div>

                <h3 id="pdf-requirements-title">
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

            {/* IMPORTANT POINTS */}

            <article
              className="result-card"
              aria-labelledby="pdf-important-points-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <Lightbulb size={20} />
                </div>

                <h3 id="pdf-important-points-title">
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

            {/* ACCESSIBILITY TIPS */}

            <article
              className="result-card"
              aria-labelledby="pdf-accessibility-tips-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <AccessibilityIcon />
                </div>

                <h3 id="pdf-accessibility-tips-title">
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

export default PDFAnalyzer;