import { useEffect, useState } from "react";
import {
  Accessibility,
  Type,
  Contrast,
  Minimize2,
  Keyboard,
  X
} from "lucide-react";

const STORAGE_KEY = "accessbridge-accessibility";

const defaultSettings = {
  largeText: false,
  highContrast: false,
  reducedComplexity: false,
  keyboardMode: false
};

function getSavedSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultSettings;
    }

    const parsed = JSON.parse(saved);

    return {
      largeText: Boolean(parsed.largeText),
      highContrast: Boolean(parsed.highContrast),
      reducedComplexity: Boolean(parsed.reducedComplexity),
      keyboardMode: Boolean(parsed.keyboardMode)
    };
  } catch {
    return defaultSettings;
  }
}

function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false);

  const [settings, setSettings] = useState(
    getSavedSettings
  );

  const {
    largeText,
    highContrast,
    reducedComplexity,
    keyboardMode
  } = settings;

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle(
      "large-text-mode",
      largeText
    );

    root.classList.toggle(
      "high-contrast-mode",
      highContrast
    );

    root.classList.toggle(
      "reduced-complexity-mode",
      reducedComplexity
    );

    root.classList.toggle(
      "keyboard-mode",
      keyboardMode
    );

    // Save settings
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [
    largeText,
    highContrast,
    reducedComplexity,
    keyboardMode,
    settings
  ]);

  // Close panel with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // Remove accessibility classes when component unmounts
  useEffect(() => {
    return () => {
      const root = document.documentElement;

      root.classList.remove(
        "large-text-mode",
        "high-contrast-mode",
        "reduced-complexity-mode",
        "keyboard-mode"
      );
    };
  }, []);

  const toggleSetting = (settingName) => {
    setSettings((previous) => ({
      ...previous,
      [settingName]: !previous[settingName]
    }));
  };

  const resetAccessibility = () => {
    setSettings(defaultSettings);
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        className="accessibility-floating-button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          isOpen
            ? "Close accessibility controls"
            : "Open accessibility controls"
        }
        aria-expanded={isOpen}
        type="button"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Accessibility size={24} />
        )}

        <span>Accessibility</span>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          className="accessibility-panel"
          role="dialog"
          aria-label="Accessibility controls"
        >
          {/* Panel Header */}
          <div className="accessibility-panel-header">
            <div>
              <Accessibility size={22} />

              <div>
                <h2>Accessibility</h2>
                <p>Customize your experience</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility controls"
            >
              <X size={20} />
            </button>
          </div>

          {/* Larger Text */}
          <button
            type="button"
            className={`accessibility-option ${
              largeText ? "active" : ""
            }`}
            onClick={() =>
              toggleSetting("largeText")
            }
            aria-pressed={largeText}
          >
            <div className="accessibility-option-icon">
              <Type size={21} />
            </div>

            <div className="accessibility-option-text">
              <strong>Larger Text</strong>
              <span>Increase text size</span>
            </div>

            <div
              className={`accessibility-toggle ${
                largeText ? "active" : ""
              }`}
              aria-hidden="true"
            >
              <div />
            </div>
          </button>

          {/* High Contrast */}
          <button
            type="button"
            className={`accessibility-option ${
              highContrast ? "active" : ""
            }`}
            onClick={() =>
              toggleSetting("highContrast")
            }
            aria-pressed={highContrast}
          >
            <div className="accessibility-option-icon">
              <Contrast size={21} />
            </div>

            <div className="accessibility-option-text">
              <strong>High Contrast</strong>
              <span>Improve color contrast</span>
            </div>

            <div
              className={`accessibility-toggle ${
                highContrast ? "active" : ""
              }`}
              aria-hidden="true"
            >
              <div />
            </div>
          </button>

          {/* Reduced Complexity */}
          <button
            type="button"
            className={`accessibility-option ${
              reducedComplexity ? "active" : ""
            }`}
            onClick={() =>
              toggleSetting("reducedComplexity")
            }
            aria-pressed={reducedComplexity}
          >
            <div className="accessibility-option-icon">
              <Minimize2 size={21} />
            </div>

            <div className="accessibility-option-text">
              <strong>Reduced Complexity</strong>
              <span>Reduce visual distractions</span>
            </div>

            <div
              className={`accessibility-toggle ${
                reducedComplexity ? "active" : ""
              }`}
              aria-hidden="true"
            >
              <div />
            </div>
          </button>

          {/* Keyboard Focus */}
          <button
            type="button"
            className={`accessibility-option ${
              keyboardMode ? "active" : ""
            }`}
            onClick={() =>
              toggleSetting("keyboardMode")
            }
            aria-pressed={keyboardMode}
          >
            <div className="accessibility-option-icon">
              <Keyboard size={21} />
            </div>

            <div className="accessibility-option-text">
              <strong>Keyboard Focus</strong>
              <span>Highlight focused controls</span>
            </div>

            <div
              className={`accessibility-toggle ${
                keyboardMode ? "active" : ""
              }`}
              aria-hidden="true"
            >
              <div />
            </div>
          </button>

          {/* Reset */}
          <button
            type="button"
            className="accessibility-reset"
            onClick={resetAccessibility}
          >
            Reset Accessibility Settings
          </button>
        </div>
      )}
    </>
  );
}

export default AccessibilityControls;