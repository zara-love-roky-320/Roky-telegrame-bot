const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "..", "config.json");

function loadConfig() {
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configData);
    if (!config.admins) {
      config.admins = [];
    }
    return config;
  } catch (error) {
    console.error("Error loading config.json:", error);
    return { admins: [], symbols: "●" };
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error saving config.json:", error);
  }
}

async function getAdminName(userId, chatInstance) {
  try {
    return `User_${userId}`;
  } catch (e) {
    return `User_${userId}`;
  }
}

module.exports = {
  name: "admin",
  prefix: true,
  admin: true,
  vip: false,
  role: 2,
  author: "ArYAN (Telegram Port)",
  version: "1.0.0",
  description: "Manage bot administrators: add, remove, list",
  usage: "!admin add [reply/mention/ID] | !admin remove [reply/mention/ID] | !admin list",
  category: "admin",

  async xyz({ chat, msg, args }) {
    const config = loadConfig();
    const symbol = config.symbols || "●";

    if (!args.length) {
      return chat.reply(
        `${symbol} Usage:\n\`!admin add [reply/mention/ID]\`\n\`!admin remove [reply/mention/ID]\`\n\`!admin list\``
      );
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === "list") {
      const admins = config.admins;
      if (admins.length === 0) {
        return chat.reply(`${symbol} No bot administrators found.`);
      }

      const adminNames = await Promise.all(
        admins.map(async (adminId) => {
          return await getAdminName(adminId, chat);
        })
      );

      const text =
        "👑 | List of admins:\n" +
        adminNames.map(n => `• ${n}`).join("\n");

      return chat.reply(text);
    }

    if (!["add", "remove"].includes(subCmd)) {
      return chat.reply(
        `${symbol} Invalid subcommand. Use: \`add\`, \`remove\`, or \`list\`.`
      );
    }

    let targetUsers = [];

    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetUsers.push(msg.reply_to_message.from.id);
    }

    if (msg.entities) {
      for (const entity of msg.entities) {
        if (entity.type === "text_mention" && entity.user) {
          targetUsers.push(entity.user.id);
        }
      }
    }
    
    if (args.length > 1 && !isNaN(parseInt(args[1]))) {
        targetUsers.push(parseInt(args[1]));
    }

    targetUsers = [...new Set(targetUsers)];

    if (targetUsers.length === 0) {
      return chat.reply(
        `${symbol} Please reply to a user, mention a user (if supported by your bot's framework for IDs), or provide a user ID.`
      );
    }

    const currentAdmins = config.admins.map(String);

    if (subCmd === "add") {
      const added = [];
      for (const userId of targetUsers) {
        const userIdStr = String(userId);
        if (!currentAdmins.includes(userIdStr)) {
          currentAdmins.push(userIdStr);
          added.push(userId);
        }
      }
      config.admins = currentAdmins;
      saveConfig(config);

      if (added.length === 0) {
        return chat.reply(`${symbol} All mentioned users are already bot administrators.`);
      }

      const addedDisplayNames = await Promise.all(
        added.map(async (userId) => {
          return await getAdminName(userId, chat);
        })
      );

      const text =
        `✅ Added bot administrator role for ${added.length} user(s):\n` +
        addedDisplayNames.map(n => `- ${n}`).join("\n");

      return chat.reply(text);
    }

    if (subCmd === "remove") {
      const removed = [];
      for (const userId of targetUsers) {
        const userIdStr = String(userId);
        const idx = currentAdmins.indexOf(userIdStr);
        if (idx !== -1) {
          currentAdmins.splice(idx, 1);
          removed.push(userId);
        }
      }
      config.admins = currentAdmins;
      saveConfig(config);

      if (removed.length === 0) {
        return chat.reply(`${symbol} None of the mentioned users are bot administrators.`);
      }

      const removedDisplayNames = await Promise.all(
        removed.map(async (userId) => {
          return await getAdminName(userId, chat);
        })
      );

      const text =
        `✅ Removed bot administrator role for ${removed.length} user(s):\n` +
        removedDisplayNames.map(n => `- ${n}`).join("\n");

      return chat.reply(text);
    }
  }
};
