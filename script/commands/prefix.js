const fs = require("fs");
const path = require("path");

module.exports = {
  name: "prefix",
  version: "0.0.1",
  author: "ArYAN",
  prefix: false,

  async xyz({ chat, msg }) {
    try {
      const configPath = path.join(__dirname, "../../config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

      const systemPrefix = config.prefix || "/";
      const userPrefix = systemPrefix;

      await chat.reply(
        `🌐 System prefix: ${systemPrefix}\n🛸 Your box chat prefix: ${userPrefix}`
      );
    } catch (err) {
      await chat.reply("❌ Failed to read config: " + err.message);
    }
  }
};
