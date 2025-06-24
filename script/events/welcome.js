module.exports = {
  name: 'welcome',
  author: "ArYAN",
  version: "0.0.1",
  description: 'Logs detailed information about incoming Telegram messages.',
  async handleEvent({ msg }) {
    try {
      const userInfo = msg.from || {};
      const username = userInfo.username || 'N/A';
      const userId = userInfo.id || 'N/A';
      const firstName = userInfo.first_name || 'N/A';
      const lastName = userInfo.last_name || 'N/A';
      const chatId = msg.chat?.id || 'N/A';
      const timestamp = msg.date
        ? new Date(msg.date * 1000).toLocaleString('en-US', { timeZone: 'Asia/Manila' })
        : 'N/A';
      const messageText = msg.text || 'Non-text message';

      let logMessage = `
Received message:
  User: ${firstName} ${lastName}
  Username: @${username}
  User ID: ${userId}
  Chat ID: ${chatId}`;


      logMessage += `
  Timestamp: ${timestamp}
  Message: ${messageText}
`;

      console.log(logMessage);

    } catch (error) {
      console.error('Error handling message event:', error);
    }
  }
};
