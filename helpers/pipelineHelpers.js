// Helper function to build product aggregation pipeline
const buildProductPipeline = (userId, options = {}) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;

  const pipeline = [];

  // Match stage - filter by user and other conditions
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

  if (minPrice !== undefined || maxPrice !== undefined) {
    matchConditions.price = {};
    if (minPrice !== undefined) matchConditions.price.$gte = minPrice;
    if (maxPrice !== undefined) matchConditions.price.$lte = maxPrice;
  }

  pipeline.push({ $match: matchConditions });

  // Lookup stage - populate createdBy field
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "creator",
    },
  });

  // Unwind the creator array (since it's a single user)
  pipeline.push({
    $unwind: {
      path: "$creator",
      preserveNullAndEmptyArrays: true,
    },
  });

  // Project stage - select only needed fields
  pipeline.push({
    $project: {
      name: 1,
      description: 1,
      price: 1,
      category: 1,
      stock: 1,
      image: 1,
      createdBy: {
        _id: "$creator._id",
        name: "$creator.name",
        email: "$creator.email",
      },
      createdAt: 1,
      updatedAt: 1,
    },
  });

  // Sort stage
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  pipeline.push({ $sort: sort });

  // Pagination stages
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  return pipeline;
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
