const MemoryOrchestrator = require('./memory/memory_orchestrator');
const fs = require('fs');
const path = require('path');

// Rutas absolutas para evitar errores de ejecución
const earsPath = path.join(__dirname, '../specs/auth-flow.ears');
const domPath = path.join(__dirname, '../specs/mock-dom.json');

try {
    const earsSpec = fs.readFileSync(earsPath, 'utf8');
    const mockDOM = JSON.parse(fs.readFileSync(domPath, 'utf8'));

    const orchestrator = new MemoryOrchestrator();

    console.log("[AGENT-JS] Iniciando simulación de aprendizaje...");

    const decision = orchestrator.retrieveContext(earsSpec, mockDOM);

    if (decision.action === 'GENERATE_NEW') {
        console.log("[AGENT-JS] Generando lógica nueva. Email de prueba: admin@comfama.com");
        const dummyCode = "await page.fill('input[name=user]', 'admin@comfama.com');";
        orchestrator.indexNewInteraction(earsSpec, mockDOM, dummyCode);
        console.log("[AGENT-JS] Interacción guardada.");
    } else {
        console.log("[AGENT-JS] ⚡ Cache Hit: Lógica recuperada de la memoria.");
    }
} catch (err) {
    console.error("[AGENT-JS] Error crítico en el laboratorio:", err.message);
}