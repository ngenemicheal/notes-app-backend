import Note from "../models/Note.js";

export async function getNotes(_, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json({ status: "success", message: "Notes fetched successfully", notes });
    } catch (error) {
        console.error("Error fetching notes:", error.message);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export async function getNote(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({ status: "error", message: "Note not found" });
        }
        res.status(200).json({ status: "success", message: "Note fetched successfully", note });
    } catch (error) {
        console.error("Error fetching note:", error.message);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ status: "error", message: "Title and content are required" });
        }
        const newNote = await Note.create({ title, content });
        res.status(201).json({ status: "success", message: "Note created successfully" });
    } catch (error) {
        console.error("Error creating note:", error.message);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export async function updateNote(req, res) {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(id, { title, content }, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ status: "error", message: "Note not found" });
        }
        res.status(200).json({ status: "success", message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        console.error("Error updating note:", error.message);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export async function deleteNote(req, res) {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ status: "error", message: "Note not found" });
        }
        res.status(200).json({ status: "success", message: "Note deleted successfully", note: deletedNote });
    } catch (error) {
        console.error("Error deleting note:", error.message);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
}
