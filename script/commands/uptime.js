module.exports = {
  name: 'uptime',
  author: 'ArYAN',
  version: '0.0.1',
  description: 'Displays the bot\'s uptime with a new cute font and detailed time units.',
  usage: 'uptime',
  category: 'UTILITY',
  async xyz({ chat }) {
    const uptimeInSeconds = process.uptime();

    const seconds = Math.floor(uptimeInSeconds % 60);
    const minutes = Math.floor((uptimeInSeconds / 60) % 60);
    const hours = Math.floor((uptimeInSeconds / (60 * 60)) % 24);
    const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));

    const formatTime = (value) => value.toString().padStart(2, '0');

    const d = formatTime(days);
    const h = formatTime(hours);
    const m = formatTime(minutes);
    const s = formatTime(seconds);

    const stylishFont = (text) => {
      const mapping = {
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
        '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
        'D': '𝑫', 'H': '𝑯', 'M': '𝑴', 'S': '𝑺',
        'a': '𝒂', 'y': '𝒚', 's': '𝒔', "'": '’',
        'h': '𝒉', 'o': '𝒐', 'u': '𝒖', 'r': '𝒓',
        'm': '𝒎', 'i': '𝒊', 'n': '𝒏', 't': '𝒕', 'e': '𝒆',
        'c': '𝒄', 'd': '𝒅',
        ' ': ' '
      };
      return text.split('').map(char => mapping[char] || char).join('');
    };

    const uptimeMessage =
      `💖 Bot Uptime Status 💖\n\n` +
      `╰┈➤ ${stylishFont("Days")} ${stylishFont(d)}\n` +
      `╰┈➤ ${stylishFont("Hours")} ${stylishFont(h)}\n` +
      `╰┈➤ ${stylishFont("Minutes")} ${stylishFont(m)}\n` +
      `╰┈➤ ${stylishFont("Seconds")} ${stylishFont(s)}\n\n` +
      `✨ _Always here to spread joy!_ ✨`;

    await chat.reply(uptimeMessage);
  }
};
