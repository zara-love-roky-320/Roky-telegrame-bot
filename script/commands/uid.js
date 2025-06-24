module.exports = {
  name: 'uid',
  author: 'ArYAN',
  version: '0.0.1',
  description: 'user uid',
  usage: 'uid [mention | reply to a message]',
  category: 'UTILITY',
  async xyz({ chat, msg }) {
    let targetUser = msg.from;

    if (msg.entities && msg.entities.length > 0) {
      const mentionEntity = msg.entities.find(entity => entity.type === 'mention' || entity.type === 'text_mention');
      if (mentionEntity) {
        if (mentionEntity.type === 'text_mention' && mentionEntity.user) {
          targetUser = mentionEntity.user;
        }
      }
    }

    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetUser = msg.reply_to_message.from;
    }

    if (targetUser) {
      const uidMessage = `🆔 ${targetUser.first_name || 'User'}'s UID: ${targetUser.id}`;
      await chat.reply(uidMessage);
    } else {
      await chat.reply('❌ Could not determine UID. Please mention a user or reply to their message.');
    }
  }
};
