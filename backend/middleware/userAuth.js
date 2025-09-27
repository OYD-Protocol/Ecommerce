import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decodedToken.id;
    
    next();
  } catch (error) {
    console.log("Error while authenticating user: ", error);
    res.status(401).json({ success: false, message: "Invalid token. Please login again." });
  }
};

export default userAuth;
