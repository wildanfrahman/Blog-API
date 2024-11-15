const db = require("../models");
const Article = db.article;
const redisClient = require("../config/redis.config");

exports.createArticle = async (req, res) => {
  try {
    const { title, summary, content } = req.body;
    const article_img = req.file ? req.file.filename : null;
    const newArticles = await Article.create({ title, article_img, summary, content });
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    await redisClient.del("articles:all");
    res.status(201).json({
      message: "data mobil berhasil ditambah",
      data: {
        title: newArticles.title,
        summary: newArticles.summary,
        content: newArticles.content,
        article_img: article_img ? `${baseUrl}/uploads/${article_img}` : null, // URL gambar
      },
    });
  } catch (error) {
    res.status(500).json({ message: "gagal menambah data artikel" });
  }
};

exports.getArticle = async (req, res) => {
  try {
    //pagination
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    //cache
    const cacheKey = `articles:page:${page}:limit:${limit}`;
    const cachedArticle = await redisClient.get(cacheKey);

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    if (cachedArticle) {
      return res.json(JSON.parse(cachedArticle));
    }

    const { count, rows: Articles } = await Article.findAndCountAll({
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    const articleData = Articles.map((article) => ({
      article_id: article.article_id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      article_img: article.article_img ? `${baseUrl}/uploads/${article.article_img}` : null,
    }));
    await redisClient.setEx(
      cacheKey,
      600,
      JSON.stringify({
        totalItems: count,
        totalPages,
        currentPage: page,
        data: articleData,
      })
    );

    res.status(200).json({
      totalItems: count,
      totalPages,
      currentPage: page,
      data: articleData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "gagal mengambil data artikel" });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const cachedArticle = await redisClient.get(`articles:${id}`);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;

    if (cachedArticle) {
      return res.json(JSON.parse(cachedArticle));
    }

    const Articles = await Article.findByPk(id);
    if (!Articles) {
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }

    const articleData = {
      article_id: Articles.article_id,
      title: Articles.title,
      summary: Articles.summary,
      content: Articles.content,
      article_img: Articles.article_img ? `${baseUrl}/uploads/${Articles.article_img}` : null,
    };

    await redisClient.setEx(`articles:${id}`, 3600, JSON.stringify(articleData));

    res.status(200).json({
      message: "data artikel berhasil diambil",
      data: articleData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "gagal mengambil data artikel" });
  }
};

//update
exports.updateArticle = async (req, res) => {
  try {
    const { title, summary, content } = req.body;
    const article_img = req.file ? req.file.filename : null;
    const { id } = req.params;
    const Articles = await Article.findByPk(id);
    if (!Articles) {
      return res.status(404).json({ message: "artikel tidak ditemukan" });
    }
    await Articles.update({
      title: title || Articles.title,
      article_img: article_img || Articles.aricle_img,
      summary: summary || Articles.summary,
      content: content || Articles.content,
    });
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    await redisClient.del("articles:all");
    await redisClient.del(`articles:${id}`);
    res.status(201).json({
      message: "data artikel berhasil diupdate",
      data: {
        article_id: Articles.article_id,
        title: Articles.title,
        summary: Articles.summary,
        content: Articles.content,
        article_img: Articles.article_img ? `${baseUrl}/uploads/${Articles.article_img}` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "gagal mengupdate data mobil" });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const Articles = await Article.findByPk(id);
    if (!Articles) {
      return res.status(404).json({ message: "artikel tidak ditemukan" });
    }
    await Articles.destroy();
    await redisClient.del("articles:all");
    await redisClient.del(`articles:${id}`);
    res.status(200).json({ message: "data berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "gagal menghapus data" });
  }
};
