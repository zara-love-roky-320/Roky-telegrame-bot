module.exports = {
  name: 'tid',
  author: 'ArYAN',
  version: '0.0.1',
  description: 'group tid',
  usage: 'tid',
  category: 'UTILITY',
  async xyz({ chat, msg }) {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const chatTitle = msg.chat.title || 'this chat';

    let responseMessage;
    if (chatType === 'private') {
      responseMessage = `👤 UID • ${chatId}`;
    } else {
      responseMessage = `TID •"${chatTitle}": ${chatId}`;
    }
    
    await chat.reply(responseMessage);
  }
};
