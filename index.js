const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const startBotLogic = require('./xyz');

const bot = new TelegramBot(config.token, { polling: true });

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.message);
});

startBotLogic(bot, config);
