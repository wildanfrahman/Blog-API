const redis = require("redis");
const { R_HOST, R_PORT } = process.env;

const client = redis.createClient({
  host: R_HOST,
  port: R_PORT,
});

client.on("error", (err) => console.error("redis client error", err));

client.connect();

module.exports = client;
