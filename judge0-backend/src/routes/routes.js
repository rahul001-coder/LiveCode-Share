import express from "express";
import { executeCode } from "../controller/controllercode.js";

const router = express.Router();

// POST: http://localhost:5000/api/code/execute
router.post("/execute", executeCode);

export default router;