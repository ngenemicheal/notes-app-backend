import express from "express";
import { getNotes, createNote, updateNote, deleteNote, getNote } from "../controllers/noteControllers.js";

const router = express.Router();

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
