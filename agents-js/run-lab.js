const MemoryOrchestrator = require('./memory/memory_orchestrator');
const fs = require('fs');
const path = require('path');

// Usamos path.join para evitar errores de rutas en Mac
const earsPath = path.join(__dirname, '../specs/auth-flow.ears');
const domPath = path.join(__dirname, '../specs/mock-dom.json');

const earsSpec = fs.readFileSync(earsPath, 'utf8');
const mockDOM = JSON.parse(fs.readFileSync(domPath, 'utf8'));

const orchestrator = new MemoryOrchestrator();

console.log("[AGENT-JS] Iniciando simulación de prueba...");
// ... resto del código