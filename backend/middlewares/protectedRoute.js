const protectedRoute = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (err) {
    console.log(err);
  }
};
