# llms_with_playwright

Playwright automation scripts that use a local LLM (Ollama/Qwen) to extract and classify HR data, then populate HRMS forms.

## What this project does

- Authenticates into HRMS and stores Playwright session state
- Extracts structured new-hire data from unstructured text
- Auto-fills employee onboarding form fields
- Classifies HR employee queries into Type/SubType/Subject

## Tech stack

- Node.js (ES modules)
- Playwright
- dotenv
- Local Ollama endpoint (`qwen2.5:7b`)

## Project structure

- `src/auth-setup.js` - login flow and session state creation
- `src/add_employee.js` - parse onboarding email and fill employee create form
- `src/index.js` - classify HR query and submit structured fields

## Setup

1. Install dependencies:
   `npm install`
2. Create `src/.env` with your own credentials:
   - `DEMO_PORTAL_CODE`
   - `DEMO_PORTAL_USERNAME`
   - `DEMO_PORTAL_PASSWORD`
3. Ensure Ollama is running locally and the model is available.

## Run

1. Create auth state:
   `node src/auth-setup.js`
2. Run onboarding automation:
   `node src/add_employee.js`
3. Run query classification flow:
   `node src/index.js`

## Security notes

- Do not commit real credentials, session state, or personal employee data.
- Keep `.env` and `auth-state.json` ignored.
- Replace hardcoded sample personal data in scripts before publishing publicly.
