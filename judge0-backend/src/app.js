import express from "express";
import cors from "cors";
import { config } from "./config.js";
import codeRoutes from "./routes/routes.js";

const app = express();

// Middlewares
app.use(cors()); // ✅ allow frontend (localhost:3000) to access backend
app.use(express.json());

// Routes
app.use("/api/code", codeRoutes);

// Start server
app.listen(config.port, () => {
    console.log(`✅ Server running at http://localhost:${config.port}`);
});