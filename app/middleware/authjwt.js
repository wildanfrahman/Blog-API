const jwt = require("jsonwebtoken");
const config = process.env.JWT_SECRET;
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId, {
    include: [{ model: Role, as: "role" }], // Sertakan model Role
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Pastikan user memiliki role
      if (!user.role) {
        // Menggunakan alias
        return res.status(404).send({ message: "Role not found" });
      }

      // Periksa apakah role adalah "admin"
      if (user.role.name === "admin") {
        // Menggunakan alias
        return next(); // Jika role adalah admin, lanjutkan
      } else {
        return res.status(403).send({
          message: "Require Admin Role!",
        });
      }
    })
    .catch((error) => {
      return res.status(500).send({ message: "Error checking roles", error: error.message });
    });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
module.exports = authJwt;
