const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(401).json({ msg: "NO token. Auth Failed" });
  }
  try {
    console.log(token);
    const decoded = jwt.verify(token, config.get("JWTSecretAdmin"));
    req.admin = decoded.admin;
    console.log(decoded.admin);
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
