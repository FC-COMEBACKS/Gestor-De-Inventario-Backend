import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999, 
    standardHeaders: true,
    legacyHeaders: false,
})

export default apiLimiter