import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Globe,
  Image as ImageIcon,
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

function ImageAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
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
   * CLEAN PREVIEW URL
   * =======================================================
   */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const validateImage = (selectedFile) => {
    if (!selectedFile) {
      return "Please select an image file.";
    }

    const validTypes = [
      "image/jpeg",
      "image/png"
    ];

    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png"
    ];

    const fileName =
      selectedFile.name.toLowerCase();

    const isValidType =
      validTypes.includes(selectedFile.type);

    const isValidExtension =
      validExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (
      !isValidType &&
      !isValidExtension
    ) {
      return "Only JPG, JPEG and PNG image files are supported.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5 MB.";
    }

    return "";
  };

  /*
   * =======================================================
   * SELECT IMAGE
   * =======================================================
   */

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const validationError =
      validateImage(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
      setResult(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    stopSpeaking();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl =
      URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(newPreviewUrl);
    setError("");
    setResult(null);
  };

  /*
   * =======================================================
   * REMOVE IMAGE
   * =======================================================
   */

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");

    stopSpeaking();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

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
   * ANALYZE IMAGE
   * =======================================================
   */

  const analyzeImage = async () => {
    if (!file) {
      setError("Please select an image file first.");
      return;
    }

    const validationError =
      validateImage(file);

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

      formData.append("image", file);
      formData.append("language", language);

      const response = await fetch(
        `${API_BASE_URL}/api/images/analyze`,
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
            "Unable to analyze the image."
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
        "Image analysis error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while analyzing the image. Please try again."
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

    speakText(
      textParts.join(". ")
    );
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
      aria-labelledby="image-analyzer-title"
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
            <ImageIcon size={26} />
          </div>

          <div>
            <h1 id="image-analyzer-title">
              Image Analyzer
            </h1>

            <p>
              Upload an image and transform
              complex information into simple
              guidance.
            </p>
          </div>

        </div>

      </div>

      <div className="analyzer-container">

        {/* INPUT CARD */}

        <section
          className="input-card"
          aria-labelledby="image-upload-heading"
        >

          <div className="input-card-header">

            <div>
              <h2 id="image-upload-heading">
                Upload Your Image
              </h2>

              <p>
                Upload a JPG, JPEG, or PNG image
                up to 5 MB for AI-powered analysis.
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
                htmlFor="image-language"
                className="sr-only"
              >
                Select output language
              </label>

              <select
                id="image-language"
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

          {/* IMAGE UPLOAD */}

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
              aria-label="Upload image file. Press Enter or Space to choose an image."
            >

              <div
                className="upload-icon"
                aria-hidden="true"
              >
                <Upload size={30} />
              </div>

              <h3>
                Choose an image file
              </h3>

              <p>
                Click here to browse your
                computer
              </p>

              <span>
                JPG, JPEG or PNG • Maximum 5 MB
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={
                  handleFileChange
                }
                hidden
                aria-label="Choose an image file"
              />

            </div>
          ) : (
            <div
              className="selected-file"
              aria-label={`Selected image file: ${file.name}`}
            >

              <div className="selected-file-info">

                <div
                  className="selected-file-icon"
                  aria-hidden="true"
                >
                  <ImageIcon size={26} />
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

              {previewUrl && (
                <div
                  className="image-preview-container"
                  aria-label="Selected image preview"
                >
                  <img
                    src={previewUrl}
                    alt={`Preview of selected image ${file.name}`}
                    className="image-preview"
                  />
                </div>
              )}

              <button
                className="remove-file-button"
                onClick={removeFile}
                type="button"
                aria-label={`Remove selected image ${file.name}`}
                title="Remove image"
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
                ? "Image ready for analysis"
                : "No image selected"}
            </span>

            <button
              className="analyze-button"
              onClick={analyzeImage}
              disabled={
                loading || !file
              }
              type="button"
              aria-label={
                loading
                  ? "Analyzing image"
                  : "Analyze image"
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
                  Analyze Image
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
            aria-labelledby="image-result-title"
          >

            <div className="results-header">

              <div>
                <h2 id="image-result-title">
                  Your Accessible Result
                </h2>

                <p>
                  The image information has been
                  simplified for easier
                  understanding.
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
              aria-labelledby="image-simple-explanation-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <Lightbulb size={20} />
                </div>

                <h3 id="image-simple-explanation-title">
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
              aria-labelledby="image-steps-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <ListChecks size={20} />
                </div>

                <h3 id="image-steps-title">
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
              aria-labelledby="image-requirements-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <CheckCircle size={20} />
                </div>

                <h3 id="image-requirements-title">
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
              aria-labelledby="image-important-points-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <Lightbulb size={20} />
                </div>

                <h3 id="image-important-points-title">
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
              aria-labelledby="image-accessibility-tips-title"
            >

              <div className="result-card-title">

                <div
                  className="result-icon"
                  aria-hidden="true"
                >
                  <AccessibilityIcon />
                </div>

                <h3 id="image-accessibility-tips-title">
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

export default ImageAnalyzer;