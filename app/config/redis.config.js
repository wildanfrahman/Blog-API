const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.on("error", (err) => console.error("redis client error", err));

client.connect();

module.exports = client;
