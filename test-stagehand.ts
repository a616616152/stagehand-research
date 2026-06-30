/**
 * Stagehand v3 - Complete test/demo script
 *
 * HOW TO USE:
 *   1. npm install @browserbasehq/stagehand dotenv zod
 *   2. cp .env.example .env (add your OPENAI_API_KEY)
 *   3. npx tsx test-stagehand.ts
 *
 * PREREQUISITES:
 *   - Node.js >= 20.19.0
 *   - For LOCAL mode: Chrome installed
 *   - For BROWSERBASE mode: valid BROWSERBASE_API_KEY
 */

import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

async function main() {
  // Configuration
  const env = (process.env.STAGEHAND_ENV || "LOCAL") as "LOCAL" | "BROWSERBASE";

  console.log("=== Stagehand Demo ===");
  console.log("Mode:", env);
  console.log("LLM:", process.env.OPENAI_API_KEY ? "OPENAI_API_KEY set" : "OPENAI_API_KEY MISSING");

  // 1. Initialize Stagehand
  const stagehand = new Stagehand({
    env,
    verbose: 1,
    ...(env === "LOCAL" && {
      localBrowserLaunchOptions: {
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
    }),
    ...(env === "BROWSERBASE" && {
      browserbaseSessionCreateParams: {
        browserSettings: { viewport: { width: 1280, height: 720 } },
      },
    }),
  });

  await stagehand.init();
  console.log("Session started:", stagehand.sessionId);

  const page = stagehand.context.pages()[0];

  try {
    // 2. Navigate
    console.log("\n--- Navigate to stagehand.dev ---");
    await page.goto("https://stagehand.dev", { waitUntil: "domcontentloaded" });
    console.log("Page loaded:", page.url());

    // 3. observe() - Discover page elements
    console.log("\n--- observe() - Discover page elements ---");
    const actions = await stagehand.observe("What can I click on this page?");
    console.log("Found", actions.length, "actionable elements:");
    actions.slice(0, 5).forEach((a, i) => {
      console.log("  [" + (i + 1) + "] " + a.description + " -> " + a.method);
    });

    // 4. extract() - Extract structured data
    console.log("\n--- extract() - Extract structured data ---");

    // 4a. Instruction only
    const headline = await stagehand.extract(
      "extract the main headline or value proposition of this page"
    );
    console.log("Headline:", JSON.stringify(headline).substring(0, 200));

    // 4b. With Zod schema
    const pageInfo = await stagehand.extract(
      "extract the key information from this page",
      z.object({
        title: z.string().describe("The page title or main heading"),
        description: z.string().describe("A brief description of what Stagehand does"),
      })
    );
    console.log("Structured extract:", JSON.stringify(pageInfo, null, 2));

    // 5. act() - Execute actions
    console.log("\n--- act() - Execute actions ---");
    const clickable = actions.find(a => a.method === "click");
    if (clickable) {
      console.log("Executing:", clickable.description);
      const result = await stagehand.act(clickable);
      console.log("Act result: success =", result.success);
    } else {
      const result = await stagehand.act("click on the first link or button");
      console.log("Act result: success =", result.success);
    }

    // 6. act() with variables
    console.log("\n--- act() with variables ---");
    const varResult = await stagehand.act(
      "type %demo% into a search input if available",
      { variables: { demo: "Stagehand AI browser automation" } }
    );
    console.log("Variable act: success =", varResult.success);

    console.log("\n=== Demo complete! ===");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await stagehand.close();
    console.log("Session closed.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
