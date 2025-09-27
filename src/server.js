import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import path from "path";

import noteRoutes from "./routes/noteRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middlewares/rateLimiter.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3005;
const __dirname = path.resolve();

app.use(express.json());

app.use((req, _, next) => {
    const now = new Date();
    const formatted = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC", // keep times consistent
    });

    const userAgent = req.get("User-Agent") || "";

    if (userAgent.includes("cron-job.org")) {
        console.log(`[${formatted}] 🔔 Cron-job.org ping → ${req.method} ${req.originalUrl} from ${req.ip}`);
    }

    next();
});

app.use(cors({
    origin: [
        "https://notes2.hegesecure.com",
        "http://localhost:5173"
    ],
}));



// if (process.env.NODE_ENV !== "production") {
//     app.use(cors({
//         origin: "https://notes2.hegesecure.com",
//     }));
// }
app.use(rateLimiter);
app.use("/api/notes", noteRoutes);


// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "../frontend/dist")));

//     app.use((_, res) => {
//         res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//     });
// }

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
