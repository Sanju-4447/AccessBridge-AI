# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# 🌉 AccessBridge AI

### AI-Powered Accessibility Platform for Simplifying Information

AccessBridge AI is an AI-powered web application designed to make difficult information easier to understand and access.

The platform allows users to provide **text, PDF documents, or images**, and uses AI to convert the information into a simple, structured, and accessible format.

It also supports **English, Telugu, and Hindi**, along with built-in text-to-speech features and accessibility controls for users with different needs.

---

## 🎯 Problem Statement

Many important documents and information are difficult to understand because they contain:

- Complex language
- Long paragraphs
- Technical terms
- Complicated instructions
- Important information hidden inside documents
- Limited accessibility for users with disabilities
- Language barriers

People may spend a lot of time trying to understand such information or may require assistance from others.

---

## 💡 Proposed Solution

AccessBridge AI uses Artificial Intelligence to transform complicated information into an easy-to-understand format.

Users can upload or enter information, and the system provides:

- Simple Explanation
- Step-by-Step Instructions
- Required Documents / Information
- Important Points
- Accessibility Tips

The system can also read the generated information aloud using text-to-speech.

---

## ✨ Key Features

### 📝 Text Analysis

Users can enter or paste text into the application.

The AI analyzes the text and provides a simplified explanation and structured information.

### 📄 PDF Analysis

Users can upload a PDF document.

AccessBridge AI extracts the relevant content and uses AI to make the information easier to understand.

### 🖼️ Image Analysis

Users can upload an image containing information.

The AI analyzes the image and provides an accessible explanation of its content.

### 🌐 Multilingual Support

The application supports:

- English
- Telugu
- Hindi

Users can select their preferred output language.

### 🔊 Text-to-Speech

Users can listen to the generated result using browser-based speech synthesis.

Available controls:

- ▶️ Play / Listen
- ⏸️ Pause
- ▶️ Resume
- ⏹️ Stop

### ♿ Accessibility Features

AccessBridge AI provides accessibility options such as:

- Larger Text
- High Contrast
- Reduced Complexity
- Keyboard Focus
- Keyboard Navigation
- Screen Reader support

The application can be used with keyboard navigation and screen readers such as Windows Narrator.

---

## 🏗️ System Architecture

```text
                    ACCESSBRIDGE AI
                          │
          ┌───────────────┼────────────────┐
          │               │                │
        Text             PDF             Image
          │               │                │
          └───────────────┼────────────────┘
                          ↓
                   React Frontend
                          │
                          │ HTTP Request
                          ↓
                  Node.js + Express
                          │
                          ↓
                     Gemini AI
                          │
                          ↓
                AI Generated Result
                          │
          ┌───────────────┼────────────────┐
          │               │                │
     Simple Text       Structured       Language
     Explanation       Information       Support
          │               │                │
          └───────────────┼────────────────┘
                          ↓
                  Accessibility Layer
                          │
              ┌───────────┴───────────┐
              │                       │
        Screen Reader            Text-to-Speech
              │                       │
              └───────────┬───────────┘
                          ↓
                         User
