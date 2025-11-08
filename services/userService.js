import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { generateToken } from "../utils/index.js";

// Register a new user
const registerUser = async (userData) => {
  try {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken({
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      tokenVersion: newUser.tokenVersion,
    });

    // Return user data without password
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return { user: userResponse, token };
  } catch (error) {
    throw new Error(`Error registering user: ${error.message}`);
  }
};

// Login user
const loginUser = async (loginData) => {
  try {
    const { email, password } = loginData;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = generateToken({
      _id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, token };
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

// Get user profile (for authenticated users)
const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Error fetching user profile: ${error.message}`);
  }
};

// Update user profile
const updateUserProfile = async (userId, updateData) => {
  try {
    const { name, email, currentPassword, newPassword } = updateData;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        throw new Error("Current password is required to set new password");
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const saltRounds = 12;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update other fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new Error("Email is already taken by another user");
      }
      user.email = email;
    }

    await user.save();

    // Return updated user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  } catch (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }
};

// Change password
const changePassword = async (userId, passwordData) => {
  try {
    const { currentPassword, newPassword } = passwordData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    await user.save();

    return { message: "Password changed successfully" };
  } catch (error) {
    throw new Error(`Error changing password: ${error.message}`);
  }
};

// Logout from all devices (invalidate all tokens)
const logoutFromAllDevices = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Increment token version to invalidate all existing tokens
    user.tokenVersion += 1;
    await user.save();

    return { message: "Logged out from all devices successfully" };
  } catch (error) {
    throw new Error(`Error logging out from all devices: ${error.message}`);
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  logoutFromAllDevices,
};
