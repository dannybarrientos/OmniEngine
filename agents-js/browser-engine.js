require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { chromium } = require('playwright');
const MemoryOrchestrator = require('./memory/memory_orchestrator');
const SpecProcessor = require('./spec-processor');
const AIConnector = require('./ai-connector');
const fs = require('fs');
const path = require('path');

// --- UTILIDADES DE BLINDAJE ---

function extractTargetNames(code) {
    const regex = /(?:name|label|text):\s*['"](.*?)['"]|getByText\(['"](.*?)['"]\)|['"]text=(.*?)['"]/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
        const name = match[1] || match[2] || match[3];
        if (name) matches.push(name.toLowerCase());
    }
    return matches;
}

async function doubleCheckHallucinations(code, cleanTree) {
    const targets = extractTargetNames(code);
    if (targets.length === 0) return true;

    const errors = targets.filter(target => 
        !cleanTree.some(node => 
            node.name.toLowerCase().includes(target) || 
            node.description?.toLowerCase().includes(target)
        )
    );

    if (errors.length > 0) {
        throw new Error(`Elementos no encontrados en la interfaz: ${errors.join(", ")}`);
    }
    return true;
}

// --- FLUJO PRINCIPAL ---

async function startOmniVision(url, provider = 'gemini') {
    const orchestrator = new MemoryOrchestrator();
    const processor = new SpecProcessor();
    const ai = new AIConnector();
    
    const earsPath = path.join(__dirname, '../specs/auth-flow.ears');
    const earsSpec = fs.readFileSync(earsPath, 'utf8');

    console.log(`[AGENT-JS] 🌐 Navegando a: ${url}`);
    const browser = await chromium.launch({ headless: true, args: ['--force-renderer-accessibility'] });
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });

        const client = await page.context().newCDPSession(page);
        const { nodes } = await client.send('Accessibility.getFullAXTree');
        const cleanTree = processor.simplifyTree(nodes);

        const decision = orchestrator.retrieveContext(earsSpec, cleanTree);

        if (decision.action === 'USE_CACHE') {
            console.log(`[AGENT-JS] ⚡ Cache Hit (${decision.status})`);
            console.log(`[AGENT-JS] 🚀 Código: ${decision.code}`);
        } else {
            console.log(`[AGENT-JS] ⚠️ Estructura nueva. Razonando con ${provider}...`);
            let realCode = await ai.generateAutomationCode(earsSpec, cleanTree, provider);
            
            try {
                await doubleCheckHallucinations(realCode, cleanTree);
                orchestrator.indexNewInteraction(earsSpec, cleanTree, realCode, 'DRAFT');
                console.log("[AGENT-JS] ✅ Código validado y guardado.");
            } catch (err) {
                console.warn(`[AGENT-JS] 🤖 Alucinación detectada: ${err.message}. Reintentando...`);
                const retryPrompt = `Error previo: ${err.message}. Usa solo estos elementos: ${JSON.stringify(cleanTree)}`;
                realCode = await ai.generateAutomationCode(retryPrompt, cleanTree, provider);
                orchestrator.indexNewInteraction(earsSpec, cleanTree, realCode, 'DRAFT');
            }
        }
    } catch (error) {
        console.error(`[AGENT-JS] ❌ Error: ${error.message}`);
    } finally {
        await browser.close();
    }
}

startOmniVision('https://example.com/login', 'gemini').catch(console.error);