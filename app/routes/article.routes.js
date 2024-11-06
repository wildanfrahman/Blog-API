const { authJwt } = require("../middleware");
const controller = require("../controllers/article.controller");
const upload = require("../middleware/mutler");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });
  //create article
  app.post("/api/article", [authJwt.verifyToken, authJwt.isAdmin], upload.single("article_img"), controller.createArticle);

  //read article
  app.get("/api/article", controller.getArticle);

  app.get("/api/article/:id", [authJwt.verifyToken], controller.getArticleById);

  //update article
  app.put("/api/article/:id", [authJwt.verifyToken, authJwt.isAdmin], upload.single("article_img"), controller.updateArticle);

  //delete article
  app.delete("/api/article/:id", [authJwt.verifyToken, authJwt.isAdmin, controller.deleteArticle]);
};
