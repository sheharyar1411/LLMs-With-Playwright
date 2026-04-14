# 🤖 LLMs with Playwright: Intelligent HR Automation

![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=nodedotjs&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-Automation-2EAD33?logo=playwright&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-black?logo=ollama&logoColor=white)
![Model](https://img.shields.io/badge/Model-Qwen2.5:7b-blue)

A modern automation toolkit demonstrating how to combine deterministic web automation (Playwright) with probabilistic generative AI (Local LLMs via Ollama) to solve complex, unstructured HR workflows.

By keeping the LLM inference entirely local, this project ensures **100% data privacy**—a critical requirement when handling sensitive HR and employee data.

---

## ⚡ Core Capabilities

* **🔒 Stateful Authentication Flow:** Logs into the HRMS portal once and securely stores the Playwright session state, bypassing redundant login steps for subsequent scripts.
* **🧠 Unstructured to Structured Data Extraction:** Uses `qwen2.5:7b` to parse messy, unstructured new-hire emails and map them to strict JSON schemas.
* **🤖 Autonomous Data Entry:** Playwright consumes the LLM-generated JSON to programmatically target and populate complex onboarding form fields.
* **🗂️ Intelligent Ticket Classification:** Analyzes employee queries to auto-categorize them by `Type`, `SubType`, and `Subject` before submission.

---

## 🏗️ Architecture & Workflow

```mermaid
sequenceDiagram
    participant User
    participant Playwright
    participant Ollama (Qwen2.5)
    participant HRMS Portal
    
    User->>Playwright: Run Auth Setup
    Playwright->>HRMS Portal: Authenticate & Save Session
    HRMS Portal-->>Playwright: auth-state.json
    
    User->>Playwright: Run Onboarding/Classification
    Playwright->>Ollama (Qwen2.5): Send unstructured HR text
    Ollama (Qwen2.5)-->>Playwright: Return structured JSON
    Playwright->>HRMS Portal: Load auth-state & navigate to forms
    Playwright->>HRMS Portal: Auto-fill fields using LLM JSON & Submit
