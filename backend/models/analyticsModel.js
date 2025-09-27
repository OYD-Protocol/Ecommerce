import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: false // Allow anonymous tracking
  },
  userEmail: { 
    type: String, 
    required: false 
  },
  userName: { 
    type: String, 
    required: false 
  },
  action: { 
    type: String, 
    required: true,
    enum: ['product_view', 'product_search', 'add_to_cart', 'remove_from_cart', 'place_order', 'user_login', 'user_register']
  },
  productId: { 
    type: String, 
    required: false 
  },
  productName: { 
    type: String, 
    required: false 
  },
  searchTerm: { 
    type: String, 
    required: false 
  },
  quantity: { 
    type: Number, 
    required: false 
  },
  orderValue: { 
    type: Number, 
    required: false 
  },
  metadata: { 
    type: Object, 
    required: false 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  sessionId: { 
    type: String, 
    required: false 
  },
  userAgent: { 
    type: String, 
    required: false 
  },
  ipAddress: { 
    type: String, 
    required: false 
  }
});

// Index for better query performance
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ action: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

const analyticsModel = mongoose.models.analytics || mongoose.model("analytics", analyticsSchema);

export default analyticsModel;
