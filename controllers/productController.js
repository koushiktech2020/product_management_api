import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
  bulkCreateProducts,
} from "../services/productService.js";

// Create a new product
const createProductController = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from JWT middleware

    // Include user ID in product data
    const productData = {
      ...req.body,
      createdBy: userId,
    };

    const product = await createProduct(productData);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk create products
const bulkCreateProductsController = async (req, res) => {
  try {
    const userId = req.user._id;
    // Expecting req.body to be an array of product objects
    const productsData = req.body.map((product) => ({
      ...product,
      createdBy: userId,
    }));
    const products = await bulkCreateProducts(productsData);
    res.status(201).json({
      success: true,
      data: products,
      message: "Bulk products created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products for the logged-in user
const getAllProductsController = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from JWT middleware
    const query = req.query;

    const result = await getAllProducts(userId, query);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single product by ID
const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await getProductById(id, userId);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product
const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const product = await updateProduct(id, userId, updateData);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await deleteProduct(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product statistics
const getProductStatsController = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await getProductStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createProductController,
  bulkCreateProductsController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getProductStatsController,
};
