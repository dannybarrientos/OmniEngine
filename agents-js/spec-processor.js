class SpecProcessor {
    constructor() {
        // Roles que realmente importan para la automatización
        this.interestingRoles = ['button', 'textbox', 'link', 'checkbox', 'combobox', 'heading'];
    }

    // Simplifica el árbol gigante de CDP a algo legible para la IA
    simplifyTree(rawNodes) {
        console.log("[SPEC-PROCESSOR] 🧹 Limpiando ruido del árbol de accesibilidad...");
        
        return rawNodes
            .filter(node => !node.ignored) // Quitar lo que el navegador ignora
            .map(node => ({
                id: node.nodeId,
                role: node.role?.value || "unknown",
                name: node.name?.value || "",
                // Solo incluimos descripción si existe
                description: node.description?.value || ""
            }))
            .filter(node => 
                this.interestingRoles.includes(node.role) || 
                (node.name && node.name !== "")
            );
    }

    // Formatea la Spec EARS para el Prompt de la IA
    formatContext(earsSpec, cleanTree) {
        return {
            instruction: "Genera código de Playwright basado en esta especificación EARS.",
            spec: earsSpec,
            context_nodes: cleanTree
        };
    }
}

module.exports = SpecProcessor;