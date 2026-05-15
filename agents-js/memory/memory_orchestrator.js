// memory/memory_orchestrator.js
module.exports = MemoryOrchestrator;
const crypto = require('crypto');

class MemoryOrchestrator {
    constructor(localCache, vectorStore, embedder) {
        this.localCache = localCache;       // ej. Instancia de Node Cache, Redis o Map simple
        this.vectorStore = vectorStore;     // ej. Conexión a LanceDB o ChromaDB
        this.embedder = embedder;           // ej. OpenAIEmbeddings u otro modelo local
    }

    /**
     * Paso 2: Normalización del DOM (@eN)
     * Limpia el HTML para mantener solo atributos clave para automatización.
     */
    parseAccessibilityTree(rawHtml) {
        // TODO: Usar cheerio o JSDOM para limpiar
        // Eliminar <style>, <script>, <svg>, clases estéticas.
        // Extraer y mantener: roles, aria-labels, data-testids, botones, inputs.
        const cleanedDOM = rawHtml; // Simulado
        return cleanedDOM;
    }

    /**
     * Genera un hash criptográfico para la comparación rápida en Nivel 1.
     */
    computeSHA256(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Paso 3: El Umbral de Indexación y Ruteo del LangGraph
     * Determina la acción a tomar basada en la similitud del DOM.
     */
    async determineAction(state) {
        // 0. Preparar el estado actual
        const cleanTree = this.parseAccessibilityTree(state.accessibilityTree);
        const domHash = this.computeSHA256(cleanTree);

        // 1. Check Caché Semántico (Nivel 1 - Fast Retrieval)
        if (this.localCache.has(domHash)) {
            console.log("⚡ [Cache Hit] Estado de DOM conocido. Ejecutando POM cacheado.");
            state.pomCode = this.localCache.get(domHash);
            return "execute_cached_pom";
        }

        // 2. Query Memoria Vectorial / RAG (Nivel 2 - Deep Context)
        const domEmbedding = await this.embedder.embed(cleanTree);
        const results = await this.vectorStore.search(domEmbedding, { topK: 1 });
        
        if (!results || results.length === 0) {
            console.log("🆕 [Miss] Pantalla completamente nueva. Generando POM desde cero.");
            return "generate_new_pom";
        }

        const nearestMatch = results[0];
        const similarityScore = nearestMatch.score; // Distancia Coseno (0.0 a 1.0)

        // 3. Lógica de Umbrales (Decisión de Self-Healing)
        if (similarityScore >= 0.95) {
            console.log(`🟢 [RAG Hit exacto: ${similarityScore}] Guardando en caché y ejecutando POM.`);
            this.localCache.set(domHash, nearestMatch.pomCode);
            state.pomCode = nearestMatch.pomCode;
            return "execute_cached_pom";

        } else if (similarityScore >= 0.75) {
            console.log(`🟡 [Mutación UI detectada: ${similarityScore}] Iniciando Self-Healing...`);
            // Pasamos el contexto roto al LLM para que repare los selectores
            state.brokenPom = nearestMatch.pomCode;
            state.historicalDOM = nearestMatch.accessibilityTree;
            return "trigger_self_healing";

        } else {
            console.log(`🔴 [Pantalla Nueva: ${similarityScore}] Contexto diferente. Generando POM desde cero.`);
            return "generate_new_pom";
        }
    }
}

module.exports = { MemoryOrchestrator };