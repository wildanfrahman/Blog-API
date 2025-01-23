const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config();

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Blog API" });
});

//db
const db = require("./models");
const Role = db.role;

db.sequelize.sync({ force: false, alter: true }).then(() => {
  console.log("Drop and Resync Db");
  initial();
});

//initial user
function initial() {
  Role.findOrCreate({
    where: { id: 1 },
    defaults: { name: "admin" },
  });

  Role.findOrCreate({
    where: { id: 2 },
    defaults: { name: "user" },
  });
}

//routes
require("./routes/auth.routes")(app);
require("./routes/article.routes")(app);

//port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server berjalan di ${PORT}.`);
});
