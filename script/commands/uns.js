module.exports = {
  name: 'unsend',
  aliases: ['uns', 'u'],
  prefix: true,
  admin: false,
  vip: false,
  author: 'ArYAN',
  version: '1.0.0',

  
  async xyz({ chat, msg, bot, chatId }) {
    if (!msg.reply_to_message) {
      return chat.reply('Please reply to the message you want me to unsend.');
    }

    const messageToDeleteId = msg.reply_to_message.message_id;

    try {
      await bot.deleteMessage(chatId, messageToDeleteId);
      await bot.deleteMessage(chatId, msg.message_id).catch(e => console.error("Error deleting user's command message:", e.message));
      console.log(`Message ${messageToDeleteId} deleted in chat ${chatId}`);
    } catch (error) {
      if (error.message.includes('MESSAGE_CANT_BE_DELETED')) {
        await chat.reply('I cannot delete this message. It might be too old, or I might not have the necessary permissions.');
      } else if (error.message.includes('MESSAGE_NOT_FOUND')) {
        await chat.reply('The message to delete was not found. It might have already been deleted.');
      } else {
        console.error(`Error deleting message ${messageToDeleteId} in chat ${chatId}:`, error.message);
        await chat.reply(`An error occurred while trying to unsend the message: ${error.message}`);
      }
    }
  }
};
