const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Article = sequelize.define(
    "articles",
    {
      article_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
      },
      summary: {
        type: DataTypes.STRING,
      },
      article_img: {
        type: DataTypes.BLOB,
      },
      content: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Article;
};
