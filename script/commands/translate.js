const axios = require('axios');

const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post(
      `https://translate.googleapis.com/translate_a/single`,
      null,
      {
        params: {
          client: 'gtx',
          sl: 'auto',
          tl: targetLang,
          dt: 't',
          q: text,
        },
      }
    );
    const translated = response.data[0][0][0];
    return translated;
  } catch (error) {
    console.error('Error translating text:', error.message);
    throw new Error('Failed to translate the text. Please try again.');
  }
};

module.exports = {
  name: "translate",
  prefix: true,
  author: "ArYAN",
  version: "1.0.0",
  description: "Translate a message into a selected language.",
  async xyz({ chat, msg, args, addAnswerCallback, config }) {
    const textToTranslate = args.join(' ');

    if (!textToTranslate && !msg.reply_to_message?.text) {
      return await chat.reply({
        body: `● Usage: \`${config.prefix}translate <text>\` or reply to a message.\n\n${config.symbols} Replace \`<text>\` with the message you want to translate.`,
        parse_mode: 'Markdown',
      });
    }

    const messageContent = textToTranslate || msg.reply_to_message.text;

    const buttonPrefix = `translate_lang_${msg.message_id}_`;

    const languageMarkup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "English", callback_data: buttonPrefix + "en" }],
          [{ text: "Bangla", callback_data: buttonPrefix + "bn" }],
          [{ text: "Hindi", callback_data: buttonPrefix + "hi" }],
          [{ text: "Arabic", callback_data: buttonPrefix + "ar" }],
        ],
      },
    };

    const waitMsg = await chat.reply({
      body: "🌐 Select a language to translate to:",
      parse_mode: "Markdown",
      ...languageMarkup,
    });

    const languages = ["en", "bn", "hi", "ar"];
    for (const langCode of languages) {
      addAnswerCallback(buttonPrefix + langCode, async ({ chat, query }) => {
        if (query.message.message_id !== waitMsg.message_id) return;

        await chat.xyz(waitMsg);

        const waitTranslateMsg = await chat.reply("Translating, please wait...");

        try {
          const translatedText = await translateText(messageContent, langCode);

          await chat.xyz(waitTranslateMsg);
          await chat.reply({
            body: `🌐 Translated Message:\n\n${translatedText}`,
            parse_mode: "Markdown",
            reply_to_message_id: msg.message_id,
          });
        } catch (error) {
          await chat.xyz(waitTranslateMsg);
          await chat.reply({
            body: "❌ Failed to translate. Please try again later.",
            reply_to_message_id: msg.message_id,
          });
        }
      });
    }
  },
};
