const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require('os');

module.exports = {
  name: "downloader",
  prefix: true,
  admin: false,
  vip: false,
  author: "ArYAN",
  version: "1.0.3",
  description: "Instant downloader for videos from social media.",
  guide: "[video_link] (Works automatically by sending a link)",
  cooldown: 0,
  category: "media",

  async xyz({ chat, msg, args, addListener, config }) {
    if (msg.text && msg.text.toLowerCase().trim() === `${config.prefix}downloader`) {
      await chat.reply(`Please send a direct video link from TikTok, Instagram, Facebook, YouTube, or X (Twitter). I will download it automatically.\n\n${config.symbols} Example: \`https://vt.tiktok.com/xxxxxx/\``);
      return;
    }

    const downloadCondition = (incomingMsg) => {
      const textContent = incomingMsg.text?.trim();
      const linkPreviewUrl = incomingMsg.link_preview_options?.url;

      const meta = {
        keyword: [
          "https://vt.tiktok.com/", "https://vt.tiktok.com",
          "https://www.tiktok.com/",
          "https://www.facebook.com/", "https://www.facebook.com",
          "https://www.instagram.com/", "https://www.instagram.com",
          "https://youtu.be/", "https://youtube.com/", "https://m.youtube.com/",
          "https://x.com/", "https://twitter.com/",
          "https://vm.tiktok.com/", "https://vm.tiktok.com",
          "https://fb.watch/", "https://fb.watch"
        ],
      };

      if (linkPreviewUrl) {
        return meta.keyword.some(urlPrefix => linkPreviewUrl.startsWith(urlPrefix));
      }

      if (textContent) {
        if (textContent.startsWith(config.prefix)) {
            return false;
        }

        return meta.keyword.some(urlPrefix =>
          textContent === urlPrefix ||
          (textContent.startsWith(urlPrefix) && textContent.length > urlPrefix.length && !textContent.substring(urlPrefix.length).includes(' '))
        );
      }

      return false;
    };

    addListener(
      downloadCondition,
      async (incomingMsg) => {
        const messageText = incomingMsg.link_preview_options?.url || incomingMsg.text?.trim();

        if (!messageText || !(
          messageText.includes("tiktok") ||
          messageText.includes("instagram") ||
          messageText.includes("facebook") ||
          messageText.includes("fb.watch") ||
          messageText.includes("youtube") ||
          messageText.includes("youtu.be") ||
          messageText.includes("x.com") ||
          messageText.includes("twitter.com")
        )) {
            return;
        }

        const messageId = incomingMsg.message_id;

        const waitMessage = await chat.reply({
          body: "⏳ Downloading...",
          options: { reply_to_message_id: messageId }
        });

        const videoPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
        try {
          const tempDir = path.join(os.tmpdir());
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

          let apiUrl = "";
          let platform = "";

          if (messageText.includes("tiktok")) {
            platform = "tiktok";
            apiUrl = `https://api-aryan-xyz.vercel.app/tikdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("instagram")) {
            platform = "instagram";
            apiUrl = `https://api-aryan-xyz.vercel.app/igdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("facebook") || messageText.includes("fb.watch")) {
            platform = "facebook";
            apiUrl = `https://api-aryan-xyz.vercel.app/fbdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("youtube") || messageText.includes("youtu.be")) {
            platform = "youtube";
            apiUrl = `https://api-aryan-xyz.vercel.app/ytdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("x.com") || messageText.includes("twitter.com")) {
            platform = "twitter";
            apiUrl = `https://api-aryan-xyz.vercel.app/x-video?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else {
            await chat.xyz(waitMessage);
            throw new Error("Unsupported URL or platform.");
          }

          const { data } = await axios.get(apiUrl);

          let videoUrl = "";
          let title = "Video downloaded!";

          switch (platform) {
            case "tiktok":
              videoUrl = data?.result?.url || data?.result?.video_url || data?.result?.videoUrl || data?.result?.result?.video_url;
              title = data?.result?.title || "TikTok Video";
              break;
            case "instagram":
              videoUrl = data?.result?.result?.video_url || data?.result?.video_url || data?.result?.videoUrl;
              title = data?.result?.result?.title || data?.result?.title || "Instagram Video";
              break;
            case "facebook":
              videoUrl = data?.result?.videoUrl || data?.result?.url || data?.result?.response?.["360p"]?.download_url;
              title =
                data?.result?.title ||
                data?.result?.response?.["360p"]?.title ||
                "Facebook Video";
              break;
            case "youtube":
              if (data?.result?.response) {
                videoUrl = data.result.response["720p"]?.download_url || data.result.response["360p"]?.download_url || "";
                title = data.result.response["720p"]?.title || data.result.response["360p"]?.title || "YouTube Video";
              } else {
                videoUrl = data?.result?.url || data?.result;
                title = data?.result?.title || "YouTube Video";
              }
              break;
            case "twitter":
                videoUrl = data?.result?.download_url || data?.result?.url;
                title = data?.result?.title || "X/Twitter Video";
                break;
          }

          if (!videoUrl) throw new Error("No video URL found in API response.");

          const writer = fs.createWriteStream(videoPath);
          const response = await axios({
            method: "GET",
            url: videoUrl,
            responseType: "stream",
          });

          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          await chat.xyz(waitMessage);

          await chat.reply({
            type: 'video',
            attachment: videoPath,
            body: `✅ Download successful! **${title}**`,
            options: { reply_to_message_id: messageId }
          });

          fs.unlinkSync(videoPath);
        } catch (error) {
          await chat.xyz(waitMessage);
          await chat.reply({
            body: `❎ Error: **${error.message}**`,
            options: { reply_to_message_id: messageId }
          });
          console.error(`Downloader error: ${error.message}`);
          if (fs.existsSync(videoPath)) {
              fs.unlinkSync(videoPath);
          }
        }
      }
    );
  }
};
