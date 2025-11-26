import axios from "axios";
import { config } from "../config.js";
const API_HOST = "judge0-ce.p.rapidapi.com";
const API_KEY = config.rapidApiKey; // ⚠️ keep secret

export async function runCode(languageId, sourceCode, stdin = "") {
    try {
        const response = await axios.post(
            `https://${API_HOST}/submissions?base64_encoded=false&wait=true`, {
                language_id: languageId,
                source_code: sourceCode,
                stdin: stdin,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Host": API_HOST,
                    "X-RapidAPI-Key": API_KEY,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Judge0 Error:", error.response.data || error.message);
        throw error;
    }
}