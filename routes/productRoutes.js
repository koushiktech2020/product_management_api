import express from "express";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getProductStatsController,
} from "../controllers/index.js";
import { authenticateToken } from "../middleware/index.js";

const router = express.Router();

// All product routes require authentication
router.use(authenticateToken);

// Product CRUD routes
router.post("/add", createProductController);
router.get("/getAll", getAllProductsController);
router.get("/stats", getProductStatsController);
router.get("/getById/:id", getProductByIdController);
router.put("/update/:id", updateProductController);
router.delete("/delete/:id", deleteProductController);

export default router;
