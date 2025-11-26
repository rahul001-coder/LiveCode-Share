import { runCode } from "../services/judge0.js";

export async function executeCode(req, res) {
    const { languageId, sourceCode, stdin } = req.body;

    if (!languageId || !sourceCode) {
        return res.status(400).json({ error: "languageId and sourceCode are required" });
    }

    try {
        const result = await runCode(languageId, sourceCode, stdin);
        res.json(result);
    } catch (err) {
        console.error("Execution error:", err.message);
        res.status(500).json({ error: "Code execution failed", details: err.message });
    }
}