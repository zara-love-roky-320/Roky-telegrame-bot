module.exports = {
  name: "eval",
  prefix: true,
  admin: true,
  vip: false,
  role: 2,
  author: "ArYAN",
  version: "0.0.1",

  async xyz({ msg, chat, args }) {
    const code = args.join(" ");
    if (!code) return;

    const out = async (text) => {
      if (!text) return;
      try {
        await chat.reply(String(text));
      } catch (e) {}
    };

    try {
      await eval(`(async () => { ${code} })()`);
    } catch (err) {
      await chat.reply(`❌ ${err.message}`);
    }
  }
};
