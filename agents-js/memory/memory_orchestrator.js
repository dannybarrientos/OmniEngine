const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class MemoryOrchestrator {
    constructor(vectorStorePath) {
        this.vectorStorePath = vectorStorePath || path.join(__dirname, 'vector_store/cache.json');
        this.similarityThreshold = 0.7;
        this.memory = this.loadMemory();
        console.log("[Kiro Kernel] 🧠 Memory Orchestrator activo.");
    }

    loadMemory() {
        try {
            if (fs.existsSync(this.vectorStorePath)) {
                return JSON.parse(fs.readFileSync(this.vectorStorePath, 'utf8'));
            }
        } catch (e) { return {}; }
        return {};
    }

    saveMemory() {
        const dir = path.dirname(this.vectorStorePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.vectorStorePath, JSON.stringify(this.memory, null, 2));
    }

    generateSpecHash(spec) {
        return crypto.createHash('sha256').update(spec).digest('hex');
    }

    retrieveContext(spec, tree) {
        const hash = this.generateSpecHash(spec);
        const data = this.memory[hash];
        if (data) return { action: 'USE_CACHE', code: data.pomCode, status: data.status };
        return { action: 'GENERATE_NEW' };
    }

    indexNewInteraction(earsSpec, cleanTree, generatedCode, status = 'DRAFT') {
        if (!cleanTree || cleanTree.length < 2) return;
        const hash = this.generateSpecHash(earsSpec);
        this.memory[hash] = {
            timestamp: new Date().toISOString(),
            status,
            nodesCount: cleanTree.length,
            a11yTree: cleanTree,
            pomCode: generatedCode
        };
        this.saveMemory();
    }
}

module.exports = MemoryOrchestrator;