const axios = require('axios');

const baseApiUrl = `${global.api.sim}/baby`;

module.exports = {
  name: "baby",
  version: "0.0.1",
  aliases: ["bby", "jan", "babu", "suna"],
  description: "xyz baby 🍼",
  author: "ArYAN",
  prefix: false,
  category: "chat",

  async xyz({ chat, msg, args, userId, config }) {
    const dipto = args.join(" ").toLowerCase();
    const teacherName = msg.from.first_name || msg.from.username || 'Unknown Teacher';

    try {
      if (!args[0]) {
        const res = await axios.get(`${baseApiUrl}?text=hi&senderID=${userId}&font=1`);
        const sentMessage = await chat.reply(res.data.reply);
        if (!global.replyCallbacks) {
          global.replyCallbacks = new Map();
        }
        global.replyCallbacks.set(sentMessage.message_id, async (replyMsg) => {
          await handleReply(chat, userId, replyMsg, sentMessage.message_id);
        });
        return;
      }

      if (args[0] === 'remove') {
        if (args.length < 2) return await chat.reply('Please provide a message to remove. Usage: `!bby remove [YourMessage]`');
        const messageToRemove = args.slice(1).join(" ");
        const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(messageToRemove)}&senderID=${userId}`);
        return await chat.reply(res.data.message);
      }

      if (args[0] === 'rm') {
        if (args.length < 2 || !dipto.includes('-')) return await chat.reply('Invalid format! Use `!bby rm [YourMessage] - [indexNumber]`');
        const parts = dipto.replace("rm ", "").split(/\s*-\s*/);
        const messageToRm = parts[0];
        const index = parts[1];
        const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(messageToRm)}&index=${index}`);
        return await chat.reply(res.data.message);
      }

      if (args[0] === 'list') {
        if (args[1] === 'all') {
          const limit = parseInt(args[2]) || 100;
          const res = await axios.get(`${baseApiUrl}?list=all`);
          const data = res.data;

          if (!data || !data.teacher || !data.teacher.teacherList) {
            return await chat.reply("No teacher data available or API is offline.");
          }

          const limitedTeachers = data.teacher.teacherList.slice(0, limit);
          const teachers = limitedTeachers.map((item) => {
            const number = Object.keys(item)[0];
            const value = item[number];
            return { name: number, value: value };
          });

          teachers.sort((a, b) => b.value - a.value);
          const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
          return await chat.reply(`Total Teach = ${data.length || '0'}\n👑 | List of Teachers of baby\n${output}`);
        } else {
          const res = await axios.get(`${baseApiUrl}?list=all`);
          const d = res.data;
          return await chat.reply(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`);
        }
      }

      if (args[0] === 'msg') {
        if (args.length < 2) return await chat.reply('Please provide a message query. Usage: `!bby msg [YourMessage]`');
        const messageQuery = args.slice(1).join(" ");
        const res = await axios.get(`${baseApiUrl}?list=${encodeURIComponent(messageQuery)}`);
        const d = res.data.data;
        return await chat.reply(`Message ${messageQuery} = ${d}`);
      }

      if (args[0] === 'edit') {
        const parts = dipto.split(/\s*-\s*/);
        if (parts.length < 2 || parts[1].length < 2) {
          return await chat.reply('❌ | Invalid format! Use `!bby edit [YourMessage] - [NewReply]`');
        }
        const originalMessage = args[1];
        const newReply = parts.slice(1).join('-').trim();
        const res = await axios.get(`${baseApiUrl}?edit=${encodeURIComponent(originalMessage)}&replace=${encodeURIComponent(newReply)}&senderID=${userId}`);
        return await chat.reply(`Changed ${res.data.message}`);
      }

      if (args[0] === 'teach') {
        let teachType = args[1];
        let messageAndReply = dipto.replace("teach ", "").split(/\s*-\s*/);

        if (teachType === 'react') {
          messageAndReply = dipto.replace("teach react ", "").split(/\s*-\s*/);
          if (messageAndReply.length < 2 || messageAndReply[1].length < 1) {
            return await chat.reply('❌ | Invalid format! Use `!bby teach react [YourMessage] - [reactEmoji]`');
          }
          const finalMessage = messageAndReply[0].trim();
          const reactContent = messageAndReply[1].trim();
          const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(finalMessage)}&react=${encodeURIComponent(reactContent)}`);
          return await chat.reply(`✅ Replies added: ${res.data.message}`);
        }
        else if (teachType === 'amar') {
          messageAndReply = dipto.replace("teach amar ", "").split(/\s*-\s*/);
          if (messageAndReply.length < 2 || messageAndReply[1].length < 2) {
            return await chat.reply('❌ | Invalid format! Use `!bby teach amar [YourMessage] - [Reply]`');
          }
          const finalMessage = messageAndReply[0].trim();
          const replyContent = messageAndReply[1].trim();
          const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(finalMessage)}&senderID=${userId}&reply=${encodeURIComponent(replyContent)}&key=intro`);
          return await chat.reply(`✅ Replies added: ${res.data.message}`);
        }
        else {
          if (messageAndReply.length < 2 || messageAndReply[1].length < 2) {
            return await chat.reply('❌ | Invalid format! Use `!bby teach [YourMessage] - [Reply]`');
          }
          const finalMessage = messageAndReply[0].replace("teach ", "").trim();
          const replyContent = messageAndReply[1].trim();
          const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(finalMessage)}&reply=${encodeURIComponent(replyContent)}&senderID=${userId}&threadID=${msg.chat.id}`);
          return await chat.reply(`✅ Replies added: ${res.data.message}\nTeacher ID: ${userId}\nTeachs: ${teacherName}`);
        }
      }

      if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
        const res = await axios.get(`${baseApiUrl}?text=amar name ki&senderID=${userId}&key=intro`);
        const sentMessage = await chat.reply(res.data.reply);
        if (!global.replyCallbacks) {
          global.replyCallbacks = new Map();
        }
        global.replyCallbacks.set(sentMessage.message_id, async (replyMsg) => {
          await handleReply(chat, userId, replyMsg, sentMessage.message_id);
        });
        return;
      }

      const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(dipto)}&senderID=${userId}&font=1`);
      const replyText = res.data.reply;

      const sentMessage = await chat.reply(replyText);

      if (!global.replyCallbacks) {
        global.replyCallbacks = new Map();
      }
      global.replyCallbacks.set(sentMessage.message_id, async (replyMsg) => {
        await handleReply(chat, userId, replyMsg, sentMessage.message_id);
      });

    } catch (e) {
      console.error(`Error in baby command:`, e);
      return await chat.reply(`An error occurred: ${e.message}`);
    }
  },

  async onChat({ chat, msg, userId, config }) {
    const text = msg.text ? msg.text.toLowerCase() : "";

    const triggerWords = ["বেবী", "bby", "bot", "jan", "babu", "janu", "baby"];
    const startsWithTrigger = triggerWords.some(word => text.startsWith(word));

    if (msg.reply_to_message && global.replyCallbacks && global.replyCallbacks.has(msg.reply_to_message.message_id)) {
        const callback = global.replyCallbacks.get(msg.reply_to_message.message_id);
        if (callback) {
            await callback(msg);
            return;
        }
    }

    if (!startsWithTrigger) {
      return;
    }

    let messageContent = text;
    for (const word of triggerWords) {
      if (text.startsWith(word)) {
        messageContent = text.substring(word.length).trim();
        break;
      }
    }

    try {
      let aiResponse;
      if (!messageContent) {
        const res = await axios.get(`${baseApiUrl}?text=hi&senderID=${userId}&font=1`);
        aiResponse = res.data.reply;
      } else if (messageContent.includes('amar name ki') || messageContent.includes('amr nam ki') || messageContent.includes('amar nam ki') || messageContent.includes('amr name ki') || messageContent.includes('whats my name')) {
        const res = await axios.get(`${baseApiUrl}?text=amar name ki&senderID=${userId}&key=intro`);
        aiResponse = res.data.reply;
      } else {
        const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(messageContent)}&senderID=${userId}&font=1`);
        aiResponse = res.data.reply;
      }

      const sentMessage = await chat.reply(aiResponse);

      if (!global.replyCallbacks) {
        global.replyCallbacks = new Map();
      }
      global.replyCallbacks.set(sentMessage.message_id, async (replyMsg) => {
        await handleReply(chat, userId, replyMsg, sentMessage.message_id);
      });

    } catch (err) {
      console.error(`Error in baby onChat:`, err);
      await chat.reply(`An error occurred during chat interaction: ${err.message}`);
    }
  }
};

async function handleReply(chat, userId, replyMsg, originalMessageId) {
  try {
    const userMessage = replyMsg.text ? replyMsg.text.toLowerCase() : "";
    const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(userMessage)}&senderID=${userId}&font=1`);
    const aiResponse = res.data.reply;

    const sentMessage = await chat.reply(aiResponse);

    if (!global.replyCallbacks) {
      global.replyCallbacks = new Map();
    }
    global.replyCallbacks.set(sentMessage.message_id, async (newReplyMsg) => {
      await handleReply(chat, userId, newReplyMsg, sentMessage.message_id);
    });

  } catch (err) {
    console.error(`Error in baby reply handler:`, err);
    await chat.reply(`An error occurred while processing your reply: ${err.message}`);
  }
}
