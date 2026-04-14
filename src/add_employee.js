import { chromium } from 'playwright';

// --- CONFIGURATION ---
const OLLAMA_ENDPOINT = 'http://127.0.0.1:11434/api/generate';
const TARGET_MODEL = 'qwen2.5:7b';

/**
 * The LLM Micro-Call: Converts an unstructured email into strict JSON HR data.
 */
// ... (Keep your existing imports and configuration) ...

async function parseNewHireEmail(emailText) {
    console.log("🧠 Routing messy email to Qwen 2.5...");
    
    // Updated prompt to match your specific screenshot fields
    const prompt = `
    You are an HR data extraction AI. Read the following email and extract the new employee's details.
    If a specific piece of information is NOT found in the email, return an empty string "" for that field. Do not make up data.
    
    Return EXACTLY this JSON structure and nothing else.
    {
        "salutation": "string (e.g., Mr, Ms, Dr)",
        "first_name": "string",
        "middle_name": "string",
        "last_name": "string",
        "gender": "string (Male or Female)",
        "cnic": "string (format: xxxxx-xxxxxxx-x)",
        "cnic_expiry": "string (YYYY-MM-DD)",
        "hiring_date": "string (YYYY-MM-DD)",
        "department": "string",
        "designation": "string",
        "employment_type": "string (e.g., Internship, Full Time, Contract)",
        "benchmark": "long int",
        "target": "long int",
        "group": "string",
        "financial_department": "string"
    }
    
    Email Text:
    "${emailText}"
    `;

    const response = await fetch(OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: TARGET_MODEL,
            prompt: prompt,
            stream: false,
            format: "json" 
        })
    });

    const data = await response.json();
    let rawResult = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(rawResult);
}

function normalizeText(value) {
    return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function selectDropdownOption(form, selectId, requestedLabel) {
    if (!requestedLabel) return;

    const select = form.locator(`#${selectId}`);
    await select.waitFor({ state: 'visible', timeout: 10000 });
    await select.locator('option').first().waitFor({ state: 'attached', timeout: 10000 });

    const options = await select.locator('option').evaluateAll((optionNodes) =>
        optionNodes.map((option) => ({
            value: option.value,
            label: (option.textContent || '').trim()
        }))
    );

    const availableOptions = options.filter((option) => option.value && option.label);
    const expected = normalizeText(requestedLabel);

    const match =
        availableOptions.find((option) => normalizeText(option.label) === expected) ||
        availableOptions.find((option) => normalizeText(option.label).includes(expected)) ||
        availableOptions.find((option) => expected.includes(normalizeText(option.label)));

    if (!match) {
        const labels = availableOptions.map((option) => option.label).join(', ');
        throw new Error(`No matching option for "${requestedLabel}" in #${selectId}. Available: ${labels}`);
    }

    await select.selectOption({ value: match.value });
}

(async () => {
    // A realistic email containing the data required for Step 1
    const messyManagerEmail = `
        Hi HR team, 
        
        Please initiate the onboarding sequence for Mr. 'Ali Hassan Raza'. He is a Male candidate we just finalized.
        He will be joining the Engineering department taking on the Designation of Project Management Officer. 
        We are bringing him on as a "Internship" employee. 
        
        His CNIC is 42101-1234567-3 and it expires on 2030-12-31. 
        Let's get his hiring date set for October 20th, 2026. 
        
        For his KPIs, his Benchmark will be "20" and his Target is "50". 
        Please process the initial profile creation and ensure his login is created.'
        The Group is "Software House" and Financial Department is "Human Resource".
    `;

// ... (Keep the browser launch and vault loading logic) ...
    console.log("🚀 Booting Automation Engine...");
    
    // headless: false so management can WATCH the ghost typing during the demo
    const browser = await chromium.launch({ headless: false, slowMo: 100 }); 
    
    // ---------------------------------------------------------
    // THE COOKIE VAULT: Bypass Login
    // ---------------------------------------------------------
    console.log("🔐 Loading Session Vault...");
    const context = await browser.newContext({ storageState: 'auth-state.json' });
    const page = await context.newPage();

    try {
        // ---------------------------------------------------------
        // 1. NAVIGATE & PROCESS
        // ---------------------------------------------------------
        console.log("🌐 Navigating directly to 'Add Employee' page...");
        // Replace with your actual internal Add Employee URL
        await page.goto('https://demourl.com');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        console.log("📍 Current URL:", page.url());

        // Call our local 7B model to process the email
        const structuredData = await parseNewHireEmail(messyManagerEmail);
        console.log("🎯 Qwen Extracted this clean data:", structuredData);

        const groupValue =
            structuredData.Group ||
            structuredData.group ||
            structuredData.GroupId ||
            '';

        const financialDepartmentValue =
            structuredData.FinancialDepartmentName ||
            structuredData.financial_department_name ||
            structuredData.financialDepartmentName ||
            '';

        const benchmarkLongInt = String(structuredData.benchmark ?? '').replace(/[^\d-]/g, '');
        const targetLongInt = String(structuredData.target ?? '').replace(/[^\d-]/g, '');

        // ---------------------------------------------------------
        // 2. DETERMINISTIC INJECTION (The "Ghost Typing")
        // ---------------------------------------------------------
        
        console.log("✍️ Ghost-typing data into Step 1...");
        
        // // Debug: Check if form exists
        // const formExists = await page.locator('#CreateForm').count();
        // console.log(`🔍 CreateForm found: ${formExists > 0 ? 'YES' : 'NO'}`);
        
        // if (formExists === 0) {
        //     // Try to find what forms exist on the page
        //     const allForms = await page.locator('form').count();
        //     console.log(`📋 Total forms on page: ${allForms}`);
            
        //     if (allForms > 0) {
        //         // Get the ID of the first form
        //         const firstFormId = await page.locator('form').first().getAttribute('id');
        //         console.log(`ℹ️ First form ID found: ${firstFormId || 'NO ID'}`);
        //     }
            
        //     throw new Error('CreateForm not found on page. Check if URL is correct or if form loads dynamically.');
        // }
        
        // Scope all fields within the CreateForm
        const form = page.locator('#CreateForm');
        
        // // Debug: Check what input fields exist in the form
        // console.log("🔍 Checking for input fields in CreateForm...");
        // const inputFields = await form.locator('input[type="text"], input[id*="txt"]').count();
        // console.log(`📝 Found ${inputFields} text input fields in form`);
        
        // // Check if txtFirstName exists (with or without being visible)
        // const firstNameExists = await form.locator('#txtFirstName').count();
        // console.log(`🎯 txtFirstName exists: ${firstNameExists > 0 ? 'YES' : 'NO'}`);
        
        // if (firstNameExists === 0) {
        //     // List all input IDs in the form to help debug
        //     const allInputs = await form.locator('input').evaluateAll(inputs => 
        //         inputs.map(input => ({ 
        //             id: input.id, 
        //             name: input.name, 
        //             type: input.type 
        //         }))
        //     );
        //     console.log("📋 All inputs in form:", JSON.stringify(allInputs, null, 2));
        //     throw new Error('txtFirstName field not found in CreateForm');
        // }
        
        // // Check if it's visible
        // const isVisible = await form.locator('#txtFirstName').isVisible();
        // console.log(`👁️ txtFirstName visible: ${isVisible ? 'YES' : 'NO'}`);
        
        // if (!isVisible) {
        //     console.log("⏳ Field exists but not visible. Checking if it's in a hidden tab/section...");
        //     // Try to take a screenshot for debugging
        //     await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
        //     console.log("📸 Saved debug-screenshot.png");
        // }
        
        // Wait for the first field to be visible
        await form.locator('#FirstName').waitFor({ state: 'visible', timeout: 10000 });
        
        // Text Inputs
        await form.locator('#FirstName').fill(structuredData.first_name);
        await form.locator('#MiddleName').fill(structuredData.middle_name);
        await form.locator('#LastName').fill(structuredData.last_name);
   //     await form.locator('#EmpBranchCode').fill('');
   //     await form.locator('#EmployeeNo').fill('');
        await form.locator('#HiringDate').fill(structuredData.hiring_date);
        await form.locator('#CNIC').fill(structuredData.cnic);
        await form.locator('#CNICExpiryDate').fill(structuredData.cnic_expiry);
   //     await form.locator('#ContractRange').fill('');
   //      await form.locator('#ConfirmationDate').fill('');
        await form.locator('#Benchmark').fill(benchmarkLongInt);
        await form.locator('#Target').fill(targetLongInt);

        // Dropdowns (Playwright can select by the visible text label)
   //     await form.locator('#Salutation').selectOption({ label: structuredData.salutation });
        await selectDropdownOption(form, 'Gender', structuredData.gender);
        await selectDropdownOption(form, 'DepartmentId', structuredData.department);
        await selectDropdownOption(form, 'DesignationId', structuredData.designation);
        await selectDropdownOption(form, 'EmploymentTypeId', structuredData.employment_type);
        await selectDropdownOption(form, 'GroupId', structuredData.group);
        await selectDropdownOption(form, 'FinancialDepartmentName', structuredData.financial_department);

        // Check the "Active Login" checkbox
        await form.locator('input[name="ActiveLogin"]').check();

        // console.log("🖱️ Clicking 'Create' and awaiting transition to Step 2...");
       
        // // Click the blue "Create" button at the bottom and wait for the wizard to load the next tab
        // await Promise.all([
        //     page.waitForLoadState('networkidle'), 
        //     page.locator('button[type="submit"]').first().click() 
        // ]);
        
        console.log("📡 Attaching Network Sniffer to catch the server's reaction...");
        
        // Listen to all responses to see what the POST request actually returns
        page.on('response', response => {
            const request = response.request();
            if (request.method() === 'POST' && request.url().includes('Employee')) {
                console.log(`\n🚨 [NETWORK INTERCEPT] POST to ${request.url()}`);
                console.log(`👉 Status Code: ${response.status()} ${response.statusText()}`);
            }
        });

        console.log("🖱️ Clicking 'Create' (Using exact text matching)...");
        
        // Use getByRole to explicitly click the button labeled "Create"
        // This prevents accidental clicks on hidden submit buttons
        await Promise.all([
            page.waitForLoadState('networkidle'), 
            page.getByRole('button', { name: 'Create', exact: true }).click()
        ]);

        console.log("🔍 Analyzing Post-Click State...");

        const finalUrl = page.url();
        console.log(`📍 Final URL: ${finalUrl}`);

        if (finalUrl.toLowerCase().includes('dashboard')) {
            console.error("❌ FAILURE: The server panicked and redirected to the Dashboard.");
            console.error("💡 Check the [NETWORK INTERCEPT] status code above. If it's a 500, we sent bad data. If it's a 302, it might be an authentication/token drop.");
        } else if (finalUrl.includes('Step=2') || !finalUrl.includes('AddEmployee')) {
             console.log("✅ Transitioned to next step successfully!");
        } else {
             console.log("⚠️ Stayed on the same page. Did the UI show any errors?");
        }

    } catch (error) {
        console.error("❌ Automation Failed:", error);
    } finally {
        // Leave the browser open for a few seconds at the end so you can see the success screen
        await page.waitForTimeout(3000);
        await browser.close();
    }
})();
