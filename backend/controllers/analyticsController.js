import analyticsModel from "../models/analyticsModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// INFO: Track user interaction
const trackUserAction = async (req, res) => {
  try {
    const { action, productId, productName, searchTerm, quantity, orderValue, metadata } = req.body;
    const { token } = req.headers;
    
    let userId = null;
    let userEmail = null;
    let userName = null;

    // If token is provided, get user info
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        userId = decodedToken.id;
        
        const user = await userModel.findById(userId);
        if (user) {
          userEmail = user.email;
          userName = user.name;
        }
      } catch (error) {
        // Continue with anonymous tracking if token is invalid
        console.log("Invalid token for analytics, continuing with anonymous tracking");
      }
    }

    const analyticsData = {
      userId,
      userEmail,
      userName,
      action,
      productId,
      productName,
      searchTerm,
      quantity,
      orderValue,
      metadata,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      sessionId: req.headers['session-id'] || null
    };

    const analytics = new analyticsModel(analyticsData);
    await analytics.save();

    res.status(200).json({ success: true, message: "Action tracked successfully" });
  } catch (error) {
    console.log("Error tracking user action: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Get all analytics data for admin
const getAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    // Filter by action type
    if (action && action !== 'all') {
      query.action = action;
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) {
        query.timestamp.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.timestamp.$lte = new Date(dateTo);
      }
    }

    const analytics = await analyticsModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const totalCount = await analyticsModel.countDocuments(query);

    res.status(200).json({
      success: true,
      analytics,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log("Error fetching analytics: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Get analytics summary/stats
const getAnalyticsSummary = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get action counts
    const actionStats = await analyticsModel.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top products viewed
    const topProducts = await analyticsModel.aggregate([
      { 
        $match: { 
          action: "product_view",
          timestamp: { $gte: startDate },
          productName: { $exists: true, $ne: null }
        } 
      },
      { $group: { _id: "$productName", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // Get top search terms
    const topSearches = await analyticsModel.aggregate([
      { 
        $match: { 
          action: "product_search",
          timestamp: { $gte: startDate },
          searchTerm: { $exists: true, $ne: null }
        } 
      },
      { $group: { _id: "$searchTerm", searches: { $sum: 1 } } },
      { $sort: { searches: -1 } },
      { $limit: 10 }
    ]);

    // Get daily activity
    const dailyActivity = await analyticsModel.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get unique users count
    const uniqueUsers = await analyticsModel.distinct("userId", {
      timestamp: { $gte: startDate },
      userId: { $ne: null }
    });

    res.status(200).json({
      success: true,
      summary: {
        actionStats,
        topProducts,
        topSearches,
        dailyActivity,
        uniqueUsersCount: uniqueUsers.length,
        totalActions: actionStats.reduce((sum, action) => sum + action.count, 0)
      }
    });
  } catch (error) {
    console.log("Error fetching analytics summary: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { trackUserAction, getAnalytics, getAnalyticsSummary };
