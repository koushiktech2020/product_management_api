import { Product } from "../models/index.js";
import { buildProductPipeline } from "../helpers/index.js";
import { toObjectId } from "../utils/index.js";

// Create a new product
const createProduct = async (productData) => {
  try {
    const product = new Product(productData);
    await product.save();
    return product;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// Get all products for a specific user
const getAllProducts = async (userId, query = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      category,
      price,
      minPrice,
      maxPrice,
      quantity,
      minQuantity,
      maxQuantity,
      startDate,
      endDate,
      createdAt,
    } = query;
    // CreatedAt date filtering
    if (startDate && !endDate) {
      // Only startDate provided: match that date (ignoring time)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
      matchConditions.createdAt = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      // Both startDate and endDate provided: match range
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    // CreatedAt date filtering
    if (createdAt) {
      // If only createdAt is provided, match that date (ignoring time)
      const start = new Date(createdAt);
      start.setHours(0, 0, 0, 0);
      const end = new Date(createdAt);
      end.setHours(23, 59, 59, 999);
      matchConditions.createdAt = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
    }

    // Convert userId to ObjectId
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new Error("Invalid user ID");
    }

    // Build match conditions for counting
    const matchConditions = { createdBy: userObjectId };

    if (search) {
      matchConditions.name = { $regex: search, $options: "i" };
    }

    if (category) {
      matchConditions.category = { $regex: category, $options: "i" };
    }

    // Price filtering
    if (price !== undefined) {
      matchConditions.price = price;
    } else if (minPrice !== undefined || maxPrice !== undefined) {
      matchConditions.price = {};
      if (minPrice !== undefined) matchConditions.price.$gte = minPrice;
      if (maxPrice !== undefined) matchConditions.price.$lte = maxPrice;
    }

    // Quantity filtering
    if (quantity !== undefined) {
      matchConditions.quantity = quantity;
    } else if (minQuantity !== undefined || maxQuantity !== undefined) {
      matchConditions.quantity = {};
      if (minQuantity !== undefined)
        matchConditions.quantity.$gte = minQuantity;
      if (maxQuantity !== undefined)
        matchConditions.quantity.$lte = maxQuantity;
    }

    // Get total count
    const total = await Product.countDocuments(matchConditions);

    // Use pipeline for paginated results
    const pipeline = buildProductPipeline(userObjectId, {
      search,
      category,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const products = await Product.aggregate(pipeline);

    return {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

// Get single product by ID (only if created by the user)
const getProductById = async (productId, userId) => {
  try {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new Error("Invalid user ID");
    }

    const product = await Product.findOne({
      _id: productId,
      createdBy: userObjectId,
    }).populate("createdBy", "name email");

    if (!product) {
      throw new Error("Product not found or access denied");
    }

    return product;
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// Update product (only if created by the user)
const updateProduct = async (productId, userId, updateData) => {
  try {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new Error("Invalid user ID");
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, createdBy: userObjectId },
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!product) {
      throw new Error("Product not found or access denied");
    }

    return product;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// Delete product (only if created by the user)
const deleteProduct = async (productId, userId) => {
  try {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new Error("Invalid user ID");
    }

    const product = await Product.findOneAndDelete({
      _id: productId,
      createdBy: userObjectId,
    });

    if (!product) {
      throw new Error("Product not found or access denied");
    }

    return { message: "Product deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

// Get product statistics for a user
const getProductStats = async (userId) => {
  try {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new Error("Invalid user ID");
    }

    const stats = await Product.aggregate([
      { $match: { createdBy: userObjectId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: "$price" },
          averagePrice: { $avg: "$price" },
          totalStock: { $sum: "$stock" },
          categories: { $addToSet: "$category" },
        },
      },
    ]);

    return (
      stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        totalStock: 0,
        categories: [],
      }
    );
  } catch (error) {
    throw new Error(`Error fetching product stats: ${error.message}`);
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
};
