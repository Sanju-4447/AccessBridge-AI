import { useState } from "react";
import {
  Accessibility,
  ArrowRight,
  BrainCircuit,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Languages,
  ShieldCheck,
  Sparkles,
  Volume2
} from "lucide-react";

import "./App.css";

import AccessibilityControls from "./components/AccessibilityControls";
import TextAnalyzer from "./pages/TextAnalyzer";
import PDFAnalyzer from "./pages/PDFAnalyzer";
import ImageAnalyzer from "./pages/ImageAnalyzer";

function Home({ onOpenAnalyzer }) {
  return (
    <div className="home-page">

      {/* Navigation */}
      <header className="home-header">
        <div className="nav-container">

          <button
            className="brand"
            onClick={() => onOpenAnalyzer("home")}
            aria-label="AccessBridge AI Home"
          >
            <div className="brand-icon">
              <Accessibility size={24} />
            </div>

            <div>
              <span className="brand-name">AccessBridge</span>
              <span className="brand-ai">AI</span>
            </div>
          </button>

          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#benefits">Benefits</a>
          </nav>

          <button
            className="nav-button"
            onClick={() => onOpenAnalyzer("text")}
          >
            Get Started
            <ArrowRight size={17} />
          </button>

        </div>
      </header>

      {/* Hero */}
      <main>

        <section className="hero-section">
          <div className="hero-container">

            <div className="hero-content">

              <div className="hero-badge">
                <Sparkles size={16} />
                AI-Powered Accessibility
              </div>

              <h1>
                Make Information
                <span> Easier for Everyone.</span>
              </h1>

              <p className="hero-description">
                AccessBridge AI transforms complex text, documents, and
                images into simple, understandable and accessible information.
              </p>

              <div className="hero-actions">

                <button
                  className="primary-button"
                  onClick={() => onOpenAnalyzer("text")}
                >
                  Start Analyzing
                  <ArrowRight size={19} />
                </button>

                <a
                  className="secondary-button"
                  href="#how-it-works"
                >
                  How It Works
                </a>

              </div>

              <div className="hero-trust">
                <div>
                  <CheckCircle size={17} />
                  Simple language
                </div>

                <div>
                  <CheckCircle size={17} />
                  Multiple languages
                </div>

                <div>
                  <CheckCircle size={17} />
                  Accessibility focused
                </div>
              </div>

            </div>

            {/* Hero Visual */}
            <div className="hero-visual">

              <div className="hero-main-card">

                <div className="visual-top">
                  <div className="visual-icon">
                    <BrainCircuit size={22} />
                  </div>

                  <div>
                    <strong>AI Accessibility Assistant</strong>
                    <span>Making information easier to understand</span>
                  </div>
                </div>

                <div className="visual-input">
                  <span>Complex Information</span>
                  <div className="fake-lines">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                </div>

                <div className="visual-arrow">
                  <ArrowRight size={20} />
                </div>

                <div className="visual-output">
                  <div className="output-title">
                    <CheckCircle size={17} />
                    Simple Explanation
                  </div>

                  <p>
                    The information has been simplified into clear and easy
                    steps that are easier to understand.
                  </p>

                  <div className="output-tags">
                    <span>Simple</span>
                    <span>Clear</span>
                    <span>Accessible</span>
                  </div>
                </div>

              </div>

              <div className="floating-card floating-language">
                <Languages size={20} />
                <div>
                  <strong>3 Languages</strong>
                  <span>English • తెలుగు • हिन्दी</span>
                </div>
              </div>

              <div className="floating-card floating-speech">
                <Volume2 size={20} />
                <div>
                  <strong>Listen</strong>
                  <span>Text-to-Speech</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Features */}
        <section id="features" className="features-section">
          <div className="section-container">

            <div className="section-heading">
              <span className="section-label">WHAT YOU CAN DO</span>

              <h2>
                One Platform. Multiple Ways to Access Information.
              </h2>

              <p>
                Choose the type of information you want to make simpler and
                let AccessBridge AI do the work.
              </p>
            </div>

            <div className="feature-grid">

              <button
                className="feature-card"
                onClick={() => onOpenAnalyzer("text")}
              >
                <div className="feature-icon text-icon">
                  <FileText size={26} />
                </div>

                <div className="feature-card-content">
                  <span className="feature-number">01</span>
                  <h3>Text Analyzer</h3>

                  <p>
                    Enter difficult or lengthy text and convert it into
                    simple, easy-to-understand information.
                  </p>

                  <span className="feature-link">
                    Analyze Text
                    <ArrowRight size={17} />
                  </span>
                </div>
              </button>

              <button
                className="feature-card"
                onClick={() => onOpenAnalyzer("pdf")}
              >
                <div className="feature-icon pdf-icon">
                  <FileText size={26} />
                </div>

                <div className="feature-card-content">
                  <span className="feature-number">02</span>
                  <h3>PDF Analyzer</h3>

                  <p>
                    Upload a PDF document and receive a simplified summary,
                    steps, requirements and important points.
                  </p>

                  <span className="feature-link">
                    Analyze PDF
                    <ArrowRight size={17} />
                  </span>
                </div>
              </button>

              <button
                className="feature-card"
                onClick={() => onOpenAnalyzer("image")}
              >
                <div className="feature-icon image-icon">
                  <ImageIcon size={26} />
                </div>

                <div className="feature-card-content">
                  <span className="feature-number">03</span>
                  <h3>Image Analyzer</h3>

                  <p>
                    Upload an image containing information and convert its
                    content into clear, accessible language.
                  </p>

                  <span className="feature-link">
                    Analyze Image
                    <ArrowRight size={17} />
                  </span>
                </div>
              </button>

            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="process-section">
          <div className="section-container">

            <div className="section-heading">
              <span className="section-label">HOW IT WORKS</span>

              <h2>From Complex Information to Clear Understanding.</h2>

              <p>
                AccessBridge AI follows a simple process designed to make
                information easier for everyone.
              </p>
            </div>

            <div className="process-grid">

              <div className="process-card">
                <div className="process-number">01</div>
                <div className="process-icon">
                  <FileText size={25} />
                </div>
                <h3>Provide Information</h3>
                <p>
                  Enter text or upload a PDF or image containing the
                  information you want to understand.
                </p>
              </div>

              <div className="process-line"></div>

              <div className="process-card">
                <div className="process-number">02</div>
                <div className="process-icon">
                  <BrainCircuit size={25} />
                </div>
                <h3>AI Understands</h3>
                <p>
                  AI processes the content and identifies the important
                  information and meaning.
                </p>
              </div>

              <div className="process-line"></div>

              <div className="process-card">
                <div className="process-number">03</div>
                <div className="process-icon">
                  <Accessibility size={25} />
                </div>
                <h3>Accessible Output</h3>
                <p>
                  Receive a simple explanation, steps, requirements and
                  important points in an accessible format.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="benefits-section">
          <div className="section-container">

            <div className="benefits-wrapper">

              <div className="benefits-content">

                <span className="section-label">WHY ACCESSBRIDGE AI</span>

                <h2>
                  Designed Around Real Accessibility Needs.
                </h2>

                <p>
                  AccessBridge AI is designed to reduce the difficulty of
                  understanding complex information and make digital content
                  more inclusive.
                </p>

                <div className="benefit-list">

                  <div>
                    <CheckCircle size={20} />
                    <span>Easy-to-understand explanations</span>
                  </div>

                  <div>
                    <CheckCircle size={20} />
                    <span>Step-by-step guidance</span>
                  </div>

                  <div>
                    <CheckCircle size={20} />
                    <span>Multilingual support</span>
                  </div>

                  <div>
                    <CheckCircle size={20} />
                    <span>Text-to-speech support</span>
                  </div>

                  <div>
                    <CheckCircle size={20} />
                    <span>Custom accessibility controls</span>
                  </div>

                </div>

              </div>

              <div className="benefits-visual">

                <div className="benefit-stat-card">
                  <Languages size={28} />
                  <strong>Multilingual</strong>
                  <span>English, Telugu & Hindi</span>
                </div>

                <div className="benefit-stat-card">
                  <Volume2 size={28} />
                  <strong>Listen</strong>
                  <span>Play, pause, resume & stop</span>
                </div>

                <div className="benefit-stat-card">
                  <ShieldCheck size={28} />
                  <strong>Accessible</strong>
                  <span>Designed for different needs</span>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-container">

            <div className="cta-icon">
              <Accessibility size={30} />
            </div>

            <h2>Ready to Make Information Simpler?</h2>

            <p>
              Start with text, PDF or image and experience accessible
              information powered by AI.
            </p>

            <button
              className="primary-button cta-button"
              onClick={() => onOpenAnalyzer("text")}
            >
              Get Started
              <ArrowRight size={19} />
            </button>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">

          <div className="footer-brand">
            <div className="brand-icon">
              <Accessibility size={21} />
            </div>

            <div>
              <strong>AccessBridge AI</strong>
              <span>Making information accessible.</span>
            </div>
          </div>

          <p>
            © 2026 AccessBridge AI. Built for inclusive digital access.
          </p>

        </div>
      </footer>

    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const openAnalyzer = (page) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      {currentPage === "home" && (
        <Home onOpenAnalyzer={openAnalyzer} />
      )}

      {currentPage === "text" && (
        <TextAnalyzer
          onBack={() => openAnalyzer("home")}
        />
      )}

      {currentPage === "pdf" && (
        <PDFAnalyzer
          onBack={() => openAnalyzer("home")}
        />
      )}

      {currentPage === "image" && (
        <ImageAnalyzer
          onBack={() => openAnalyzer("home")}
        />
      )}

      <AccessibilityControls />
    </>
  );
}

export default App;