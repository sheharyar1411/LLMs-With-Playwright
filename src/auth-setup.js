import { chromium } from 'playwright';
import 'dotenv/config';

(async () => {
    console.log("🔐 Starting Headless Authentication Sequence...");

    // We launch a fresh, invisible browser instance
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log("🌐 Navigating to the HRMS Login Page...");
        // Replace with your actual HRMS login URL
        await page.goto('https://demohrms.eplanetcom.com/User/Login');

        console.log("⌨️ Injecting Service Account Credentials...");
        
        // Replace selectors with the actual login form IDs
        await page.locator('#CompanyCode').fill(process.env.DEMO_PORTAL_CODE);
        await page.locator('#UserName').fill(process.env.DEMO_PORTAL_USERNAME);
        await page.locator('#Password').fill(process.env.DEMO_PORTAL_PASSWORD);

        console.log("🖱️ Submitting Login & Waiting for .NET Postback...");
        await Promise.all([
            page.waitForLoadState('networkidle'), 
            page.getByRole('button', { name: /sign in/i }).click() 
        ]);

        // Verify login was successful - wait for URL to change from login page
        await page.waitForFunction(() => !window.location.href.includes('Login'), { timeout: 10000 });
        
        console.log("✅ Login Successful. Landed on:", page.url());

        // THE MAGIC: Save the complete authentication state to a local file
        console.log("💾 Saving session state to 'auth-state.json'...");
        await context.storageState({ path: 'auth-state.json' });

        console.log("🚀 Vault Secured. Future scripts will use this state.");

    } catch (error) {
        console.error("❌ Authentication Failed. Check selectors or network:", error);
    } finally {
        await browser.close();
    }
})();