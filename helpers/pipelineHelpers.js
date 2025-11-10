// Helper function to build product aggregation pipeline
const buildProductPipeline = (userId, options = {}) => {
  const {
    search,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;

  // Build match conditions
  const matchConditions = { createdBy: userId };

  if (search) {
    matchConditions.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    matchConditions.price = {};
    if (minPrice !== undefined) matchConditions.price.$gte = minPrice;
    if (maxPrice !== undefined) matchConditions.price.$lte = maxPrice;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Return optimized pipeline array directly
  return [
    { $match: matchConditions },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        price: 1,
        quantity: 1,
        image: 1,
        createdBy: {
          _id: "$creator._id",
          name: "$creator.name",
          email: "$creator.email",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ];
};

// Helper function to build product stats pipeline
const buildProductStatsPipeline = (userId) => {
  return [
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        averagePrice: { $avg: "$price" },
        totalStock: { $sum: "$stock" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        categories: { $addToSet: "$category" },
        lowStockProducts: {
          $sum: {
            $cond: [{ $lt: ["$stock", 10] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
        totalValue: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
        totalStock: 1,
        minPrice: 1,
        maxPrice: 1,
        categoryCount: { $size: "$categories" },
        categories: 1,
        lowStockProducts: 1,
      },
    },
  ];
};

// Helper function to build category-wise stats pipeline
const buildCategoryStatsPipeline = (userId) => {
  return [
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        averagePrice: { $avg: "$price" },
        totalStock: { $sum: "$stock" },
      },
    },
    {
      $project: {
        category: "$_id",
        count: 1,
        totalValue: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
        totalStock: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ];
};

export {
  buildProductPipeline,
  buildProductStatsPipeline,
  buildCategoryStatsPipeline,
};
