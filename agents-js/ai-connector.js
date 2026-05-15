const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

class AIConnector {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "EMPTY");
        this.openCodeClient = new OpenAI({
            apiKey: process.env.OPENCODE_API_KEY || "EMPTY",
            baseURL: process.env.OPENCODE_BASE_URL
        });
    }

    async generateAutomationCode(earsSpec, cleanTree, provider = 'gemini') {
        const prompt = `Actúa como Senior QA. Genera código Playwright para esta Spec: "${earsSpec}". 
        Usa estos elementos: ${JSON.stringify(cleanTree)}. Solo código, sin markdown.`;

        try {
            if (provider === 'gemini') {
                const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                return result.response.text().replace(/```javascript|```/g, "").trim();
            }
            // Lógica para OpenCode...
            return `// Placeholder para ${provider}`;
        } catch (e) {
            return `// Error: ${e.message}`;
        }
    }
}

module.exports = AIConnector;