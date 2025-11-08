import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication routes - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful requests (only count failures)
  skipSuccessfulRequests: true,
});

// Create product rate limiter - 50 requests per 10 minutes
export const productLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 product requests per windowMs
  message: {
    success: false,
    message: "Too many product requests, please try again later.",
    retryAfter: "10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login attempt limiter - 3 failed attempts per 5 minutes
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 login attempts per windowMs
  message: {
    success: false,
    message: "Too many login attempts, account temporarily locked.",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed login attempts
  skipSuccessfulRequests: true,
  // Use a different key for login attempts with proper IPv6 support
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = req.body?.email || "unknown";
    return `login_${ip}_${email}`;
  },
});
