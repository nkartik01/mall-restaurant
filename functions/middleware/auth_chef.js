const jwt = require("jsonwebtoken");
const config = require("../config/default.json");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(401).json({ msg: "NO token. Auth Failed" });
  }
  try {
    const decoded = jwt.verify(token, config.JWTSecretChef);
    req.chef = decoded.chef;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
