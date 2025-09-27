import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";

// INFO: Create express app
const app = express();
const port = process.env.PORT || 4000;
connectDB();

// INFO: Middleware
app.use(express.json());
app.use(cors());

// INFO: Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// INFO: API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

// INFO: Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// INFO: Start server
app.listen(port, () =>
  console.log(`Server is running on at http://localhost:${port}`)
);
