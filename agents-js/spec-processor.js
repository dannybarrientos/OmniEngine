class SpecProcessor {
    constructor() {
        this.interestingRoles = ['button', 'textbox', 'link', 'checkbox', 'combobox', 'heading'];
    }

    simplifyTree(rawNodes) {
        console.log("[SPEC-PROCESSOR] 🧹 Limpiando ruido...");
        return rawNodes
            .filter(node => !node.ignored)
            .map(node => ({
                role: node.role?.value || "unknown",
                name: node.name?.value || "",
                description: node.description?.value || ""
            }))
            .filter(node => 
                this.interestingRoles.includes(node.role) || 
                (node.name && node.name !== "")
            );
    }
}

module.exports = SpecProcessor;