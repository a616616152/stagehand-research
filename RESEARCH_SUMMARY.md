Stagehand Research Summary

Overview:
Stagehand (v3.6.0) is Browserbase's TypeScript SDK - an AI browser automation framework. Package: @browserbasehq/stagehand

Installation:
- npx create-browser-app (new project scaffold)
- npm install @browserbasehq/stagehand (existing project)
- Needs OPENAI_API_KEY env var
- Optional: BROWSERBASE_API_KEY for cloud browsers

Core API:
1. new Stagehand({ env: "LOCAL" or "BROWSERBASE" }) + await init() + await close()
2. await stagehand.act("click the login button") - execute actions
3. await stagehand.observe("find all buttons") - discover elements
4. await stagehand.extract("extract price", z.number()) - structured data
5. stagehand.agent({mode:"cua"}) + await agent.execute("task") - autonomous

Demo available in /home/ubuntu/stagehand-research/ on the local filesystem.
See the demo script for complete working examples of all APIs.
