import mongoose from "mongoose";

// Convert string ID to mongoose ObjectId
const toObjectId = (id) => {
  if (!id) return null;

  try {
    // If it's already an ObjectId, return as is
    if (id instanceof mongoose.Types.ObjectId) {
      return id;
    }

    // If it's a valid ObjectId string, convert it
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }

    // If invalid, return null
    return null;
  } catch (error) {
    console.error("Error converting to ObjectId:", error);
    return null;
  }
};

export default toObjectId;