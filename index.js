// index.js o main.js
const { MemoryOrchestrator } = require('./memory/memory_orchestrator');

// --- CONFIGURACIÓN DE COMPORTAMIENTO ---
const CONFIG = {
    USE_CACHE: true,      // Nivel 1: Activa/Desactiva el Caché Semántico rápido
    SELF_HEAL: true,       // Nivel 2: Permite que el sistema intente reparar POMs mutados
    DEBUG_MODE: true
};

/**
 * INSTANCIACIÓN DEL CEREBRO (MemoryOrchestrator)
 * Aquí inyectamos los proveedores de servicios. 
 * (Asegúrate de tener tus instancias de VectorStore y Embedder listas)
 */
const memory = new MemoryOrchestrator(
    new Map(),            // LocalCache: Usando un Map simple para desarrollo (puedes usar Redis en prod)
    vectorStoreInstance,  // Tu conexión a LanceDB/ChromaDB
    embeddingModel        // Tu modelo de embeddings (ej. OpenAI o local)
);

/**
 * LÓGICA DE INTEGRACIÓN EN EL FLUJO DE EJECUCIÓN
 * Este es un ejemplo de cómo llamar al orquestador dentro de tu ciclo de prueba.
 */
async function runTestStep(currentState) {
    console.log(`🔍 Analizando estado del DOM en: ${currentState.url}`);

    // Si el caché está apagado globalmente, forzamos generación nueva
    if (!CONFIG.USE_CACHE) {
        return "generate_new_pom";
    }

    const decision = await memory.determineAction(currentState);

    // Lógica de flags para Self-Healing
    if (decision === "trigger_self_healing" && !CONFIG.SELF_HEAL) {
        console.log("⚠️ Self-healing detectado pero desactivado por CONFIG. Forzando nueva generación.");
        return "generate_new_pom";
    }

    return decision;
}

// Ejemplo de uso dentro del loop del Agente
// const action = await runTestStep(state);