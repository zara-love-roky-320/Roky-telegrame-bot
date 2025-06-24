const axios = require('axios');

module.exports = {
  name: 'alldl',
  prefix: true,
  admin: false,
  vip: false,
  author: 'ArYAN',
  version: '1.0.0',
  async xyz({ chat, msg, args }) {
    const url = args[0];

    if (!url) {
      return chat.reply('Please provide a video URL. Example: `/alldl [video link]`');
    }

    try {
      const apiUrl = `https://aryan-video-downloader.vercel.app/alldl?url=${encodeURIComponent(url)}`;
      await chat.reply('Downloading video, please wait...');

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status === 'success' && data.data && data.data.url) {
        const videoUrl = data.data.url;
        await chat.reply({
          type: 'video',
          content: videoUrl,
          body: 'Here is your video!',
          parse_mode: 'Markdown'
        });
      } else {
        await chat.reply('There was an issue downloading the video. Please verify if you provided a correct link.');
        console.error('API Error Response:', data);
      }
    } catch (error) {
      console.error('Error in alldl command:', error);
      await chat.reply(`Failed to download the video. Error: ${error.message}`);
    }
  }
};
