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

🛠️ Tech Stack
Runtime Environment: Node.js (Using ES Modules)

Browser Automation: Playwright

Local AI Inference: Ollama

Foundation Model: qwen2.5:7b (Optimized for coding, instruction following, and structured output)

Environment Management: dotenv

📂 Project Structure
Plaintext
llms_with_playwright/
│
├── src/
│   ├── .env                    # Environment variables (Ignored by Git)
│   ├── auth-setup.js           # Handles initial login & session storage
│   ├── add_employee.js         # Parses emails -> fills new-hire forms
│   └── index.js                # Classifies queries -> submits tickets
│
├── auth-state.json             # Playwright session state (Generated, Ignored by Git)
├── package.json
└── README.md
🚀 Getting Started
1. Prerequisites
Node.js (v18 or higher recommended)

Ollama installed and running on your local machine.

2. Prepare the Local Model
Ensure your local Ollama instance has the required model downloaded. Open your terminal and run:

Bash
ollama run qwen2.5:7b
3. Installation
Clone the repository and install dependencies:

Bash
git clone <your-repo-url>
cd llms_with_playwright
npm install
4. Configuration
Create a .env file inside the src/ directory. Do not commit this file.

Code snippet
# src/.env
DEMO_PORTAL_CODE=your_company_code
DEMO_PORTAL_USERNAME=your_username
DEMO_PORTAL_PASSWORD=your_secure_password
💻 Usage
Execute the scripts in the following order:

Step 1: Generate Session State
Authenticate with the HRMS and save the session state to avoid logging in during every run.

Bash
node src/auth-setup.js
(This generates auth-state.json in your root directory).

Step 2: Run Automation Workflows
Depending on your task, run one of the following automated flows:

Option A: Automate Employee Onboarding
Parses an unstructured onboarding email, extracts the data using the local LLM, and auto-fills the HR portal.

Bash
node src/add_employee.js
Option B: HR Query Classification & Submission
Reads a raw employee query, asks the LLM to classify it (Type/SubType/Subject), and submits the structured data.

Bash
node src/index.js
🛡️ Security & Privacy Guidelines
Handling HR data requires strict adherence to security protocols:

Zero Data Egress: Because this uses a local Ollama model, no Personally Identifiable Information (PII) is sent to external APIs (like OpenAI or Anthropic).

Credential Management: Never commit your .env file. Ensure it is listed in your .gitignore.

Session State Security: The auth-state.json file contains active session cookies. It must remain local and is ignored via .gitignore.

Data Sanitization: If you intend to fork or publish this repository publicly, ensure all hardcoded sample data in add_employee.js and index.js uses fictitious information (e.g., John Doe, fake addresses).

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

📝 License
This project is licensed under the MIT License.
