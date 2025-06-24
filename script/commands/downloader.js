const axios = require('axios');
const { alldown } = require('aryan-videos-downloader');

module.exports = {
  name: "alldown",
  aliases: ["alldl", "dl", "down"],
  prefix: true,
  admin: false,
  vip: false,
  author: "ArYAN",
  version: "0.0.1",
  description: "Download video from a given URL.",
  
  async xyz({ chat, msg, args }) { 
    const inputLink = args[0];

    if (!inputLink) {
      return chat.reply('❌ *Input Link!* Example: `/alldl <link>`');
    }

    const waitMsg = await chat.reply('⏳ Processing your request...');

    try {
      const apis = await alldown(inputLink);
      if (!apis || !apis.data || !apis.data.high || !apis.data.title) {
        throw new Error("Invalid response from downloader API.");
      }
      
      const { high, title } = apis.data;

      const caption = `🎬 *Title:* ${title}`;
      
      await chat.sendVideo(
        { 
          video: high,
          caption: caption,
          parse_mode: 'Markdown',
        },
        { 
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔗 Bot Owner', url: 'https://t.me/ArYANAHMEDRUDRO' }],
            ],
          },
        }
      );

    } catch (error) {
      console.error('Error in alldown command:', error.message);
      await chat.reply('❌ An error occurred while processing your request. Please check the link or try again later.');
    } finally {
      if (waitMsg && waitMsg.message_id) {
        await chat.xyz(waitMsg);
      }
    }
  },
};
