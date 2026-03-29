const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("--- DEBUGGING TOKEN ---");
  console.log("1. Raw Header received:", token);

  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided" });

  try {
    const actualToken = token.split(" ")[1];
    console.log("2. Token extracted:", actualToken);
    console.log("3. Secret being used:", process.env.JWT_SECRET);

    const verified = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log("4. Verification success! User is:", verified);

    req.user = verified;
    next();
  } catch (error) {
    console.error("5. Verification failed because:", error.message);
    res.status(400).json({ message: "Invalid Token" });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "ADMIN") {
      next();
    } else {
      res.status(403).json({ message: "Access Denied: Admins only" });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
