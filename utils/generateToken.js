import jwt from "jsonwebtoken";

const generateToken = (userData = {}) => {
  try {
    const { _id, email, role } = userData;

    // Create payload
    const payload = {
      _id,
      email,
      role: role || "user",
    };

    // Generate token with expiration from env
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Failed to generate authentication token");
  }
};

export default generateToken;
