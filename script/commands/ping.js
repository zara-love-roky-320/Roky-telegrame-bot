module.exports = {
  name: 'ping',
  prefix: true,
  vip: false,
  admin: false,
  category: 'UTILITY',
  aliases: [],
  author: 'ArYAN',
  version: '1.0.0',

  async xyz({ chat, bot, msg }) {
    const start = Date.now();
    const sent = await chat.reply('Pinging...');
    const end = Date.now();
    const latency = end - start;

    await bot.editMessageText(`🏓 Pong!\nResponse time: ${latency}ms`, {
      chat_id: msg.chat.id,
      message_id: sent.message_id,
      message_thread_id: msg.chat.type === 'supergroup' && msg.message_thread_id ? msg.message_thread_id : undefined
    }).catch(error => {
      console.error('Error editing ping message:', error.message);
      chat.reply(`Failed to edit message, but latency was ${latency}ms.`);
    });
  }
};
