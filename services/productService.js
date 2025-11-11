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
      name,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      startDate,
      endDate,
    } = query;

    // Convert userId to ObjectId
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new Error("Invalid user ID");
    }

    // Build match conditions
    const matchConditions = { createdBy: userObjectId };

    // Name search
    if (name) {
      matchConditions.name = { $regex: name, $options: "i" };
    }

    // Price filtering
    if (minPrice && maxPrice) {
      matchConditions.$and = [
        { price: { $gte: parseInt(minPrice) } },
        { price: { $lte: parseInt(maxPrice) } },
      ];
    } else if (minPrice) {
      matchConditions.price = { $gte: parseInt(minPrice) };
    } else if (maxPrice) {
      matchConditions.price = { $lte: parseInt(maxPrice) };
    }

    // Quantity filtering
    if (minQuantity && maxQuantity) {
      matchConditions.$and = [
        { quantity: { $gte: parseInt(minQuantity) } },
        { quantity: { $lte: parseInt(maxQuantity) } },
      ];
    } else if (minQuantity) {
      matchConditions.quantity = { $gte: parseInt(minQuantity) };
    } else if (maxQuantity) {
      matchConditions.quantity = { $lte: parseInt(maxQuantity) };
    }

    // CreatedAt date filtering
    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      if (startDate) {
        matchConditions.createdAt = { $gte: new Date(startDate) };
      }
      if (endDate) {
        matchConditions.createdAt = { $lte: new Date(endDate) };
      }
    }

    // Use pipeline for paginated results
    const pipeline = buildProductPipeline(userObjectId, {
      matchConditions,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const products = await Product.aggregate(pipeline);

    // Get total count for pagination
    const total = await Product.countDocuments(matchConditions);

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
