module.exports = {
  name: 'help',
  prefix: true,
  vip: false,
  admin: false,
  category: 'utility',
  aliases: ['commands'],
  author: 'ArYAN',
  version: '0.0.1',

  async xyz({ chat, args }) {
    if (args.length) {
      const query = args[0].toLowerCase();
      const cmd = [...global.commands.values()].find(
        c => c.name === query || (c.aliases && c.aliases.includes(query))
      );
      if (!cmd) return chat.reply(`No command called “${query}”.`);
      const info = cmd;
      const detail = `
╭─────────────────────◊
│ ▸ Command: ${info.name}
│ ▸ Aliases: ${info.aliases?.length ? info.aliases.join(', ') : 'None'}
│ ▸ Can use: ${info.admin ? 'Admin Only' : info.vip ? 'VIP Only' : 'All Users'}
│ ▸ Category: ${info.category?.toUpperCase() || 'UNCATEGORIZED'}
│ ▸ PrefixEnabled?: ${info.prefix === false ? 'False' : 'True'}
│ ▸ Author: ${info.author || 'Unknown'}
│ ▸ Version: ${info.version || 'N/A'}
╰─────────────────────◊
      `.trim();
      return chat.reply(detail);
    }

    const cats = {};
    [...global.commands.values()]
      .filter((command, index, self) =>
        index === self.findIndex((c) => c.name === command.name)
      )
      .forEach(c => {
        const cat = c.category || 'UNCATEGORIZED';
        if (!cats[cat]) {
          cats[cat] = [];
        }
        if (!cats[cat].includes(c.name)) {
          cats[cat].push(c.name);
        }
      });

    let msg = '';
    Object.keys(cats).forEach(cat => {
      msg += `╭─────『 ${cat.toUpperCase()} 』\n`;
      cats[cat].sort().forEach(n => {
        msg += `│ ▸ ${n}\n`;
      });
      msg += `╰──────────────\n`;
    });

    msg += `
╭──────────────◊
│ » Total commands: ${[...new Set(global.commands.values())].length}
│ » A Powerful Telegram bot
│ » ♡Alvee Evan Roky♡
╰──────────◊
「 ♡Your Baby♡ 」
    `.trim();

    await chat.reply(msg);
  }
};
