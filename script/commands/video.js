const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const { URL } = require("url");
const os = require('os');

module.exports = {
  name: "video",
  aliases: ["yt"],
  description: "Download YouTube video or audio by name or URL",
  prefix: true,
  category: "music",
  author: "ArYAN",
  version: "1.0.0",
  admin: false,
  vip: false,

  async xyz({ bot, chat, msg, args, chatId, userId, config }) {
    const apiKey = "itzaryan";
    let type = "video";
    let videoId, topResult;

    if (!args.length) {
      return chat.reply("❗ Please enter a YouTube URL or song name.\n\nExample:\n`/video tum hi ho`\n`/video -v <YouTube_Video_URL>`\n`/video -a <YouTube_Video_URL>`");
    }

    let loadingMessage = null;
    try {
        loadingMessage = await chat.reply("📥 Fetching your media, please wait...");
    } catch (e) {
        console.error("Failed to send loading message:", e.message);
    }

    try {
      const mode = args[0];
      const inputArg = args[1];

      if ((mode === "-v" || mode === "-a") && inputArg) {
        type = mode === "-a" ? "audio" : "video";

        let urlObj;
        try {
          urlObj = new URL(inputArg);
        } catch (e) {
          const query = args.join(" ");
          const results = await ytSearch(query);
          if (!results || !results.videos || results.videos.length === 0) {
            throw new Error("❌ No results found for your query.");
          }
          topResult = results.videos[0];
          videoId = topResult.videoId;
        }

        if (urlObj && (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be"))) {
            if (urlObj.hostname.includes("youtu.be")) {
                videoId = urlObj.pathname.slice(1);
            } else {
                videoId = urlObj.searchParams.get("v");
            }
        } else if (!videoId) {
            const query = args.join(" ");
            const results = await ytSearch(query);
            if (!results || !results.videos || results.videos.length === 0) {
              throw new Error("❌ No results found for your query.");
            }
            topResult = results.videos[0];
            videoId = topResult.videoId;
        }

        if (!videoId) throw new Error("❌ Couldn't extract video ID from the URL or no valid search query.");

        if (!topResult) {
            const results = await ytSearch(videoId);
            if (!results || !results.videos || results.videos.length === 0) {
              throw new Error("❌ Couldn't fetch video details for the provided URL. Video might not exist or is private.");
            }
            topResult = results.videos[0];
        }

      } else {
        type = "video";
        const query = args.join(" ");
        const results = await ytSearch(query);
        if (!results || !results.videos || results.videos.length === 0) {
          throw new Error("❌ No results found for your query.");
        }
        topResult = results.videos[0];
        videoId = topResult.videoId;
      }

      const timestamp = topResult.timestamp || "0:00";
      const durationParts = timestamp.split(":").map(Number);
      const durationSec = durationParts.length === 3
        ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
        : durationParts[0] * 60 + durationParts[1];

      if (durationSec > 600) {
        throw new Error(`❌ This video is too long (${timestamp}). Max 10 minutes allowed.`);
      }

      const apiUrl = `https://noobs-xyz-aryan.vercel.app/youtube?id=${videoId}&type=${type}&apikey=${apiKey}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.downloadUrl) {
          throw new Error("❌ Failed to get download URL from the API. The API might be down or returned no valid URL.");
      }

      const response = await axios.get(data.downloadUrl, { responseType: "arraybuffer" });

      const ext = type === "audio" ? "mp3" : "mp4";
      const cleanTitle = topResult.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 50);
      const filename = `${cleanTitle}.${ext}`;
      const filePath = path.join(os.tmpdir(), filename);
      fs.writeFileSync(filePath, response.data);

      const caption = `${type === "audio" ? "🎵 **AUDIO INFO**" : "🎬 **VIDEO INFO**"}\n` +
                      `━━━━━━━━━━━━━━━\n` +
                      `📌 **Title:** ${topResult.title}\n` +
                      `🎞 **Duration:** ${topResult.timestamp}\n` +
                      `📺 **Channel:** ${topResult.author.name}\n` +
                      `👁 **Views:** ${topResult.views.toLocaleString()}\n` +
                      `📅 **Uploaded:** ${topResult.ago}`;

      const mediaOptions = {
        caption: caption,
        parse_mode: "Markdown"
      };

      if (type === "audio") {
        await chat.sendAudio(filePath, mediaOptions);
      } else {
        await chat.sendVideo(filePath, mediaOptions);
      }

      fs.unlinkSync(filePath);

      if (loadingMessage) {
        await chat.xyz(loadingMessage);
      }

    } catch (err) {
      console.error("Video command error:", err.message);
      if (loadingMessage) {
        try {
          await chat.xyz(loadingMessage);
        } catch (deleteError) {
          console.error("Error deleting loading message on error:", deleteError.message);
        }
      }
      return chat.reply(`❌ Error: ${err.message}`);
    }
  }
};
