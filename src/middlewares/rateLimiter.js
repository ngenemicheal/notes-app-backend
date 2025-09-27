import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await ratelimit.limit("limit-key");
        if (!success) {
            return res.status(429).json({ status: "error", message: "Rate limit exceeded" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "error", message: "Rate Limiting Error" });
    }
}

export default rateLimiter;
