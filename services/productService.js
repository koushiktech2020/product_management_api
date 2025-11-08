import { Product } from "../models/index.js";
import { buildProductPipeline } from "../helpers/index.js";

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
      search,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    // Build match conditions for counting
    const matchConditions = { createdBy: userId };

    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      matchConditions.category = { $regex: category, $options: "i" };
    }

    // Get total count
    const total = await Product.countDocuments(matchConditions);

    // Use pipeline for paginated results
    const pipeline = buildProductPipeline(userId, {
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
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId,
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
    const product = await Product.findOneAndUpdate(
      { _id: productId, createdBy: userId },
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
    const product = await Product.findOneAndDelete({
      _id: productId,
      createdBy: userId,
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
    const stats = await Product.aggregate([
      { $match: { createdBy: userId } },
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
