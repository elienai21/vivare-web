const Anthropic = require("@anthropic-ai/sdk").default;

const fs = require("fs");
const env = fs.readFileSync(".env.local", "utf-8");
const config = {};
env.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) config[match[1]] = match[2].replace(/(^"|"$)/g, '').trim();
});

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

async function testClaude() {
    console.log("Calling Claude API...");
    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929", // <-- WAIT A MINUTE! IS THIS A REAL MODEL?
            max_tokens: 1500,
            system: "Você é um assistente testando a API.",
            messages: [{ role: "user", content: "Responda com 'OK'" }],
        });
        console.log("SUCCESS:", message.content[0].text);
    } catch (e) {
        console.error("CLAUDE ERROR:", e.message);
    }
}
testClaude();
