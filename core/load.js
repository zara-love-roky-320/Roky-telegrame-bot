const fs = require('fs').promises;
const path = require('path');
const config = require('../config.json');
const { createChat } = require('../aryan/chat');

global.commands = new Map();
global.events = new Map();

async function loadFiles(dir, type, handler, c, separator) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      await loadFiles(fullPath, type, handler, c, separator);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      try {
        delete require.cache[require.resolve(fullPath)];
        const mod = require(fullPath);

        const file = mod.config || mod.toki || mod.ownersv2 || mod.meta || mod;

        if (!handler.validator(file)) {
          console.warn(`${c.yellow}[WARNING]${c.reset} ${item.name} (${type}) is missing essential properties or failed validation. Skipping.`);
          continue;
        }

        await handler.process(file, item.name);
        console.log(`${c.green}  loading ${type} ${c.yellow}${file.name}${c.reset}`);
      } catch (err) {
        console.error(`${c.red}[ERROR]${c.reset} Error loading ${type} ${item.name}:`, err);
      }
    }
  }
}

async function loadCommands(bot, c, separator) {
  global.commands.clear();

  const handler = {
    validator: cmd => cmd.name && cmd.author && cmd.version,
    process: cmd => {
      global.commands.set(cmd.name, cmd);
      if (cmd.aliases && Array.isArray(cmd.aliases)) {
        cmd.aliases.forEach(alias => global.commands.set(alias, cmd));
      }
    },
  };

  await loadFiles(path.join(__dirname, '../script/commands'), 'command', handler, c, separator);

  const telegramCmds = [];

  try {
    await bot.setMyCommands(telegramCmds);
  } catch (err) {
    console.error(`${c.red}[ERROR]${c.reset} Error setting Telegram commands:`, err);
    console.error(`${c.red}  Please check Telegram Bot API limits or command format issues.${c.reset}`);
  }
}

async function loadEvents(bot, c, separator) {
  global.events.clear();
  Object.keys(bot.eventNames())
    .filter(e => e !== 'message')
    .forEach(e => bot.removeAllListeners(e));

  const handler = {
    validator: evt => evt.name && typeof evt.handleEvent === 'function',
    process: async evt => {
      global.events.set(evt.name, evt);
      bot.on(evt.name, async (...args) => {
        try {
          await evt.handleEvent({ bot, args, config });
        } catch (err) {
          console.error(`${c.red}[ERROR]${c.reset} Event handler for '${evt.name}' error:`, err);
        }
      });
    },
  };

  await loadFiles(path.join(__dirname, '../script/events'), 'event', handler, c, separator);

  bot.removeAllListeners('message');
  bot.on('message', async msg => {
    if (!msg.from || msg.from.is_bot) return;

    const chat = await createChat(bot, msg);
    const ctx = { bot, chat, msg, chatId: msg.chat.id, userId: msg.from.id.toString(), config };

    for (const e of global.events.values()) {
      if (e.name === 'message' && typeof e.handleEvent === 'function') {
        try {
          await e.handleEvent(ctx);
        } catch (err) {
          console.error(`${c.red}[ERROR]${c.reset} Message event handler error:`, err);
        }
      }
    }
  });
}

async function setuploadHandler(bot, c, separator) {
  console.log("\n" + separator(`${c.bold}${c.cyan}LOADING ALL COMMANDS${c.reset}`));
  await loadCommands(bot, c, separator);
  await loadEvents(bot, c, separator);
}

module.exports = { setuploadHandler };
