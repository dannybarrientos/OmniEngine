const { chromium } = require('playwright');
const MemoryOrchestrator = require('./memory/memory_orchestrator');
const SpecProcessor = require('./spec-processor');
const fs = require('fs');
const path = require('path');

async function startOmniVision(url) {
    const orchestrator = new MemoryOrchestrator();
    const processor = new SpecProcessor();
    const earsPath = path.join(__dirname, '../specs/auth-flow.ears');
    
    if (!fs.existsSync(earsPath)) {
        console.error(`[AGENT-JS] ❌ Error: Spec no encontrada en ${earsPath}`);
        return;
    }
    const earsSpec = fs.readFileSync(earsPath, 'utf8');

    console.log(`[AGENT-JS] 🌐 Navegando a: ${url}`);
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--force-renderer-accessibility'] 
    });
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        console.log("[AGENT-JS] 👁️ Capturando Árbol de Accesibilidad (@eN)...");

        let rawA11yTree = null;
        if (page.accessibility) {
            rawA11yTree = await page.accessibility.snapshot({ interestingOnly: false });
        }

        if (!rawA11yTree) {
            console.log("[AGENT-JS] ⚠️ Usando túnel CDP...");
            const client = await page.context().newCDPSession(page);
            const axTree = await client.send('Accessibility.getFullAXTree');
            rawA11yTree = axTree.nodes;
        }

        if (!rawA11yTree) throw new Error("No se pudo obtener el árbol.");

        // --- EL PROCESO SEMÁNTICO EMPIEZA AQUÍ ---
        
        // 1. Limpiamos el árbol inmediatamente
        const cleanTree = processor.simplifyTree(rawA11yTree);
        console.log(`[AGENT-JS] 🤏 Árbol reducido de ${rawA11yTree.length} a ${cleanTree.length} nodos.`);

        // 2. Consultamos la memoria usando el árbol LIMPIO
        const decision = orchestrator.retrieveContext(earsSpec, cleanTree);

        if (decision.action === 'USE_CACHE') {
            console.log("[AGENT-JS] ⚡ Cache Hit: Interfaz conocida.");
            console.log(`[AGENT-JS] 🔧 Ejecutando lógica recuperada: ${decision.code}`);
        } else {
            console.log("[AGENT-JS] ⚠️ Estructura nueva detectada. Iniciando aprendizaje...");
            
            // Aquí simularíamos la llamada a la IA
            const generatedCode = `await page.click('button'); // Basado en ${url}`;
            
            // 3. Guardamos la versión LIMPIA para que la próxima vez el Cache Hit sea exacto
            orchestrator.indexNewInteraction(earsSpec, cleanTree, generatedCode);
            console.log("[AGENT-JS] 💾 Firma SEMÁNTICA guardada en vector store.");
        }

    } catch (error) {
        console.error(`[AGENT-JS] ❌ Error: ${error.message}`);
    } finally {
        await browser.close();
    }
}

startOmniVision('https://example.com/login').catch(err => console.error(err));