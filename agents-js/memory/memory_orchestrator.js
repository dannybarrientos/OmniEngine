const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class MemoryOrchestrator {
    constructor(vectorStorePath) {
        // Definir ruta por defecto si no se provee una
        this.vectorStorePath = vectorStorePath || path.join(__dirname, 'vector_store/cache.json');
        this.similarityThreshold = 0.85;
        this.memory = this.loadMemory();
        console.log("[Kiro Kernel] 🧠 Memory Orchestrator inicializado.");
    }

    loadMemory() {
        try {
            if (fs.existsSync(this.vectorStorePath)) {
                return JSON.parse(fs.readFileSync(this.vectorStorePath, 'utf8'));
            }
        } catch (error) {
            console.error("[MEMORY] Error cargando base de datos:", error);
        }
        return {};
    }

    saveMemory() {
        const dir = path.dirname(this.vectorStorePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.vectorStorePath, JSON.stringify(this.memory, null, 2));
    }

    generateSpecHash(earsSpec) {
        return crypto.createHash('sha256').update(earsSpec).digest('hex');
    }

    retrieveContext(earsSpec, currentA11yTree) {
        const specHash = this.generateSpecHash(earsSpec);
        const cachedData = this.memory[specHash];

        if (cachedData) {
            const similarity = this.calculateSimilarity(cachedData.a11yTree, currentA11yTree);
            if (similarity >= this.similarityThreshold) {
                return { action: 'USE_CACHE', code: cachedData.pomCode };
            }
            return { action: 'SELF_HEAL', cachedTree: cachedData.a11yTree };
        }
        return { action: 'GENERATE_NEW' };
    }

    calculateSimilarity(treeA, treeB) {
        const strA = JSON.stringify(treeA);
        const strB = JSON.stringify(treeB);
        if (strA === strB) return 1.0;
        const diff = Math.abs(strA.length - strB.length);
        const maxLen = Math.max(strA.length, strB.length);
        return 1 - (diff / maxLen);
    }

    indexNewInteraction(earsSpec, currentA11yTree, generatedPomCode) {
        const specHash = this.generateSpecHash(earsSpec);
        this.memory[specHash] = {
            timestamp: new Date().toISOString(),
            a11yTree: currentA11yTree,
            pomCode: generatedPomCode
        };
        this.saveMemory();
    }
}

module.exports = MemoryOrchestrator;