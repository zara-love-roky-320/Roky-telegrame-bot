const { checkRateLimit } = require('../aryan/rateLimit');
const { createChat } = require('../aryan/chat');
const { addListener } = require('../aryan/listener');
const config = require('../config.json');
global.config = config;

const answerCallbacks = new Map();

function addAnswerCallback(buttonId, callback) {
  answerCallbacks.set(buttonId, callback);
  console.log(`Answer callback registered for button ${buttonId}`);
}

function setupMessageHandler(bot, c) {
  bot.on('message', async (msg) => {
    if (!msg.from) {
      console.log('Ignoring message with no sender information');
      return;
    }

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const text = msg.text || '';
    const hasPrefix = text.startsWith(config.prefix);
    const chat = await createChat(bot, msg);

    console.log(`\n${c.cyan}───────────────────────────────────────`);
    console.log(`${c.yellow}Incoming Message:`);
    console.log(`${c.green}  User: ${msg.from.first_name || 'N/A'} ${msg.from.last_name || ''} (${userId})`);
    console.log(`${c.green}  Username: ${msg.from.username ? '@' + msg.from.username : 'N/A'}`);
    console.log(`${c.green}  Chat ID: ${chatId}`);
    if (msg.message_thread_id) {
        console.log(`${c.green}  Topic ID: ${msg.message_thread_id}`);
    }
    console.log(`${c.green}  Message: ${text}`);
    console.log(`${c.cyan}───────────────────────────────────────${c.reset}`);


    let commandName, args;
    if (hasPrefix) {
      args = text.slice(config.prefix.length).trim().split(/ +/);
      commandName = args.shift().toLowerCase();
    } else {
      args = text.trim().split(/ +/);
      commandName = args.shift().toLowerCase();
    }

    if (msg.reply_to_message && global.replyCallbacks.has(msg.reply_to_message.message_id)) {
      console.log(`Handling reply to message ${msg.reply_to_message.message_id} with text: "${text}"`);
      const callback = global.replyCallbacks.get(msg.reply_to_message.message_id);
      try {
        await callback(msg);
        console.log(`Reply callback executed for message ${msg.reply_to_message.message_id}`);
      } catch (error) {
        console.error(`Error in reply callback for message ${msg.reply_to_message.message_id}:`, error);
        await chat.reply('Error processing reply.');
      }
      return;
    }

    const command = global.commands.get(commandName);
    
    if (command) {
      if (command.prefix === true && !hasPrefix) {
        console.log(`Command ${commandName} ignored: requires prefix`);
        return;
      }
      if (command.prefix === false && hasPrefix) {
        console.log(`Command ${commandName} ignored: does not allow prefix`);
        return;
      }

      if (command.admin && !config.admins.includes(userId)) {
        console.log(`Command ${commandName} blocked: user ${userId} is not admin`);
        await chat.reply('Admin access required.');
        return;
      }
      if (command.vip && !config.vips.includes(userId) && !config.admins.includes(userId)) {
        console.log(`Command ${commandName} blocked: user ${userId} is not VIP or admin`);
        await chat.reply('VIP access required.');
        return;
      }

      if (!checkRateLimit(userId, commandName)) {
        console.log(`Command ${commandName} blocked: rate limit exceeded for user ${userId}`);
        await chat.reply('Slow down! Try again in a moment.');
        return;
      }

      try {
        const initialize = command.xyz;
        if (typeof initialize === 'function') {
            await initialize({ 
              bot, 
              chat, 
              msg, 
              args, 
              chatId, 
              userId, 
              config, 
              addListener, 
              addAnswerCallback,
              commands: global.commands 
            });
            console.log(`Command ${commandName} executed by user ${userId}`);
        } else {
            console.error(`Command ${commandName} has no executable 'xyz' function.`);
            await chat.reply('Error: Command not properly configured.');
        }
      } catch (error) {
        console.error(`Error in command ${commandName}:`, error);
        await chat.reply(`Error executing command \`${commandName}\`.\nReason: \`${error.message}\``);
      }
    } else if (hasPrefix) {
      console.log(`Unknown command: ${commandName}`);
      await chat.reply('Please enter a command after the prefix or type help to see available commands.');
    } else {
      for (const listener of global.listeners) {
        if (listener.condition(msg)) {
          listener.action(msg);
          console.log(`Listener triggered for message: ${text}`);
          return;
        }
      }
    }
  });

  bot.on('callback_query', async (query) => {
    const userId = query.from.id.toString();
    const chatId = query.message.chat.id;
    const callbackData = query.data;
    const chat = await createChat(bot, query.message);

    try {
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Error answering callback query:', error);
    }

    if (answerCallbacks.has(callbackData)) {
      const callback = answerCallbacks.get(callbackData);
      try {
        await callback({ bot, chat, query, chatId, userId, config });
        console.log(`Answer callback executed for button ${callbackData} by user ${userId}`);
      } catch (error) {
        console.error(`Error in answer callback ${callbackData}:`, error);
        await chat.reply('Error processing button action.');
      }
    } else {
      console.log(`No callback found for button ${callbackData}`);
      await chat.reply('Unknown button action.');
    }
  });
}

module.exports = { setupMessageHandler };
