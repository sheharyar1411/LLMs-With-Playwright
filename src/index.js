import { chromium } from 'playwright';

// --- CONFIGURATION ---
const OLLAMA_ENDPOINT = 'http://127.0.0.1:11434/api/generate';
const TARGET_MODEL = 'qwen2.5:7b';

/**
 * Sends employee query to Qwen 7B to classify into HR categories.
 */
async function classifyHRQueryWithQwen(queryText) {
    console.log("🧠 Classifying HR query with Qwen 2.5...");
    
    const prompt = `
    You are an HR Query Classification AI. Analyze the following employee query/complaint and classify it.
    
    Available Type options: "General Query", "Complaint", "Grievance", "Referral", "Suggestion"
    Available SubType options: "Coworker", "Favoritism", "Harassment", "Job Role", "Salary Issue", "Supervisor Behavior", "Workload", "Work Environment", "Other"
    
    Extract:
    1. "type": The most appropriate Type from the options above (String).
    2. "subType": The most appropriate SubType from the options above (String).
    3. "subject": A brief 3-5 word summary of the query (String).
    
    You must respond ONLY with valid JSON. No markdown, no conversational text.
    Format: {"type": "Complaint", "subType": "Workload", "subject": "Need new equipment"}
    
    Employee Query to classify:
    "${queryText}"
    `;

    const response = await fetch(OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: TARGET_MODEL,
            prompt: prompt,
            stream: false,
            format: "json" // Enforce JSON schema
        })
    });

    const data = await response.json();
    let rawResult = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(rawResult);
}

(async () => {
    console.log("🔌 Connecting to your active Chrome session...");
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0]; 

    // NOTE: Navigate manually to an employee's appraisal edit page before running this script.
    console.log(`✅ Attached to active page: ${await page.title()}`);

    try {
        // ---------------------------------------------------------
        // TASK 1: READ THE EMPLOYEE QUERY
        // ---------------------------------------------------------
        console.log("🔍 Extracting employee query text...");
        const queryText = await page.locator('#Description').inputValue();
        console.log(`📄 Found Query: "${queryText.substring(0, 60)}..."`);

        // ---------------------------------------------------------
        // TASK 2: LLM CLASSIFICATION (The Micro-Call)
        // ---------------------------------------------------------
        const extractedData = await classifyHRQueryWithQwen(queryText);
        console.log("🎯 Qwen 7B Classification:", extractedData);

        // ---------------------------------------------------------
        // TASK 3: POPULATE STRUCTURED .NET FIELDS
        // ---------------------------------------------------------
        console.log("✍️ Injecting structured data into the hidden/required form fields...");
        
        // Swap these selectors with your actual HRMS element IDs
        await page.locator('#Type').selectOption(extractedData.type);
        await page.locator('#SubType').selectOption(extractedData.subType);
        await page.locator('#Subject').fill(extractedData.subject);

        
        // if (extractedData.requires_pip) {
        //     await page.locator('#chkRequirePIP').check();
        // } else {
        //     await page.locator('#chkRequirePIP').uncheck();
        // }

        // ---------------------------------------------------------
        // TASK 4: THE .NET POSTBACK TRIGGER
        // ---------------------------------------------------------
        console.log("🖱️ Submitting form and waiting for legacy server postback...");
        
        // Wait for the __VIEWSTATE to re-render after the save action
        await Promise.all([
            page.waitForLoadState('networkidle'), 
            page.locator('#btnSubmit').click() 
        ]);

        console.log("🚀 Postback complete. Employee record updated successfully!");

    } catch (error) {
        console.error("❌ Automation Failed:", error);
    } finally {
        await browser.close();
    }
})();