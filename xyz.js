const fs = require('fs');
const path = require('path');
const https = require('https');

const c = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  pink: "\x1b[95m",
  lavender: "\x1b[38;5;183m",
  orange: "\x1b[38;5;208m",
  mint: "\x1b[38;5;121m",
  bold: "\x1b[1m",
};

const separator = (title) =>
  `${c.cyan}────────────────────────────────────────────\n${title}\n────────────────────────────────────────────${c.reset}`;

global.commands = new Map();
global.replyCallbacks = new Map();
global.reactionCallbacks = new Map();
global.listeners = [];
global.rateLimits = new Map();

function loadApis() {
  const apisPath = path.join(__dirname, 'setup', 'apis.json');
  try {
    const data = fs.readFileSync(apisPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read APIs file:', err);
    return {};
  }
}
global.api = loadApis();

const HARDCODED_OWNER_USERNAME = "ArYANAHMEDRUDRO";
const HARDCODED_OWNER_UID = "7888999718";       

function loadOwnerInfo(config) {
  const ownerInfoPath = path.join(__dirname, 'setup', 'xyz.json');
  
  if (!config.token || config.token.length < 20) {
    console.error(`\n${c.bold}${c.magenta}╔═══╦═══╦═══╦═══╦═══╗\n║╔══╣╔═╗║╔═╗║╔═╗║╔═╗║\n║╚══╣╚═╝║╚═╝║║─║║╚═╝║\n║╔══╣╔╗╔╣╔╗╔╣║─║║╔╗╔╝\n║╚══╣║║╚╣║║╚╣╚═╝║║║╚╗\n╚═══╩╝╚═╩╝╚═╩═══╩╝╚═╝${c.reset}`);
    console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.orange}Invalid or Missing Bot Token!`);
    console.error(`[🔰] ${c.bold}${c.blue}Please ensure your 'config.json' has a valid Telegram bot token.`);
    console.error(`[🚫] ${c.bold}${c.red}Bot cannot start without a correct token.${c.reset}`);
    process.exit(1);
  }

  try {
    const data = fs.readFileSync(ownerInfoPath, 'utf8');
    const ownerInfo = JSON.parse(data);

    if (!ownerInfo.owner || typeof ownerInfo.owner !== 'string' || ownerInfo.owner.trim() === '') {
      console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.yellow}Missing or invalid 'owner' (Telegram username) in setup/xyz.json.${c.reset}`);
      process.exit(1);
    }
    if (!ownerInfo.uid || typeof ownerInfo.uid !== 'string' || !/^\d+$/.test(ownerInfo.uid)) {
      console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.yellow}Missing or invalid 'uid' (Telegram user ID) in setup/xyz.json. It should be a string of digits.${c.reset}`);
      process.exit(1);
    }
    
    if (ownerInfo.owner !== HARDCODED_OWNER_USERNAME || ownerInfo.uid !== HARDCODED_OWNER_UID) {
      console.error(`\n${c.bold}${c.magenta}╔═══╦═══╦═══╦═══╦═══╗\n║╔══╣╔═╗║╔═╗║╔═╗║╔═╗║\n║╚══╣╚═╝║╚═╝║║─║║╚═╝║\n║╔══╣╔╗╔╣╔╗╔╣║─║║╔╗╔╝\n║╚══╣║║╚╣║║╚╣╚═╝║║║╚╗\n╚═══╩╝╚═╩╝╚═╩═══╩╝╚═╝${c.reset}`);
      console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.orange}Mismatch in owner information in setup/xyz.json`);
      console.error(`[🔰] ${c.bold}${c.blue}Username '${HARDCODED_OWNER_USERNAME}'`);
      console.error(`[🔰] ${c.bold}${c.blue}Owner UID ${HARDCODED_OWNER_UID}'`);
      console.error(`[✅] ${c.bold}${c.green}Found in setup/xyz.json`);
      console.error(`[🚫] ${c.bold}${c.red}Please correct setup/xyz.json or contact the original developer${c.reset}`);
      process.exit(1);
    }

    return ownerInfo;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.orange}'setup/xyz.json' file not found. Please create it with owner username and UID.${c.reset}`);
    } else if (err instanceof SyntaxError) {
      console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.orange}Error parsing 'setup/xyz.json'. Make sure it's valid JSON.${c.reset}`);
    } else {
      console.error(`${c.bold}${c.red}[ERROR]${c.reset} ${c.orange}Failed to load owner info from setup/xyz.json: ${err.message}${c.reset}`);
    }
    console.error(`${c.bold}${c.red}  Bot cannot run without correct owner information. Exiting.${c.reset}`);
    process.exit(1);
  }
}

function getUserRole(userId, config) {
  if (userId.toString() === HARDCODED_OWNER_UID) return 2;
  if (config.admins.includes(userId.toString())) return 2;
  if (config.vips.includes(userId.toString())) return 1;
  return 0;
}

const originalSet = global.commands.set.bind(global.commands);
global.commands.set = (name, command) => {
  const originalFunction = command.xyz;
  command.xyz = async (ctx) => {
    const userId = ctx.msg?.from?.id || ctx.from?.id;
    const userRole = getUserRole(userId, global.config); 
    const required = command.role ?? 0;

    if (userRole < required) {
      return ctx.chat?.reply?.('❌ You are not allowed to use this command.') ||
             ctx.bot?.sendMessage(ctx.msg.chat.id, '❌ You are not allowed to use this command.');
    }

    await originalFunction(ctx);
  };
  originalSet(name, command);
};

async function startBotLogic(bot, config) {
  global.ownerInfo = loadOwnerInfo(config); 

  let messageHandlers;
  try {
    messageHandlers = require('./core/message');
  } catch (error) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Failed to load './core/message.js'.`);
    console.error(`\x1b[31m  Reason:\x1b[0m ${error.message}`);
    console.error(`\x1b[33m  Please ensure 'core/message.js' exists at the correct path relative to index.js and exports 'setupMessageHandler'.\x1b[0m`);
    process.exit(1);
  }

  const { setupMessageHandler } = messageHandlers;

  if (typeof setupMessageHandler !== 'function') {
      console.error(`\x1b[31m[ERROR]\x1b[0m 'setupMessageHandler' is not a function or not exported from './core/message.js'.`);
      console.error(`\x1b[33m  Please check the exports in 'core/message.js'. It should have: module.exports = { setupMessageHandler };\x1b[0m`);
      process.exit(1);
  }

  const { setupEditHandler } = require('./core/edit');
  const { setuploadHandler } = require('./core/load');

  global.config = config; 

  try {
    await setuploadHandler(bot, c, separator);

    console.log("\n" + separator(`${c.bold}${c.green}BOT INFORMATION${c.reset}`));
    const botInfo = await bot.getMe();
    console.log(`${c.cyan}Bot Name: ${c.green}${botInfo.first_name}${c.reset}`);
    console.log(`${c.cyan}Bot Username: ${c.green}@${botInfo.username}${c.reset}`);
    console.log(`${c.cyan}Bot ID: ${c.green}${botInfo.id}${c.reset}`);
    console.log(`${c.cyan}Bot Prefix: ${c.green}${config.prefix}${c.reset}`);
    console.log(`${c.cyan}Admins: ${c.green}${config.admins.join(', ') || 'None'}${c.reset}`);
    console.log(`${c.cyan}VIPs: ${c.green}${config.vips.join(', ') || 'None'}${c.reset}`);
    console.log(`${c.cyan}Bot Owner: ${c.green}${global.ownerInfo.owner} (${global.ownerInfo.uid})${c.reset}`);


    console.log("\n" + separator(`${c.bold}${c.orange}ADMIN INFORMATION${c.reset}`));
    const adminTxtUrl = "https://raw.githubusercontent.com/itzaryan008/Telegram-Control/main/admin.txt";
    https.get(adminTxtUrl, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        console.log(`${c.cyan}${data.trim()}${c.reset}`);
      });
    }).on("error", (err) => {
      console.error(`${c.red}[ERROR]${c.reset} Could not fetch admin info: ${err.message}`);
    });

    setupMessageHandler(bot, c);
    setupEditHandler(bot);
    console.log(`\n${c.green}${c.bold}Bot is running...${c.reset}`);
  } catch (error) {
    console.error(`${c.red}[ERROR]${c.reset} Failed to start bot:`, error.message, `\n${c.red}Please check for configuration issues.${c.reset}`);
  }
}

module.exports = startBotLogic;
