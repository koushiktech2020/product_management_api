import express from "express";
import {
  createProductController,
  bulkCreateProductsController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getProductStatsController,
} from "../controllers/index.js";
import { authenticateToken, productLimiter } from "../middleware/index.js";

const router = express.Router();

// All product routes require authentication
router.use(authenticateToken);

// Apply product rate limiter to all product routes
router.use(productLimiter);

// Product CRUD routes
router.post("/", createProductController);
router.get("/", getAllProductsController);
router.get("/stats", getProductStatsController);
router.get("/:id", getProductByIdController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);

// Bulk product creation route
router.post("/bulk", bulkCreateProductsController);

export default router;
