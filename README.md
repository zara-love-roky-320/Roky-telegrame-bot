# xyz Telegram Bot

**ARYAN Telegram Bot** is a modular, feature-rich Telegram bot written in Node.js. It supports various utility and fun commands, developer tools, and message automation. The project is designed for easy customization, scalability, and active community contribution.

---

## 🚀 Features

- ✅ Modular command system
- 💬 Event-based response handling
- ⏱ Rate limiting support
- 🧰 Developer utilities like eval and prefix control
- 📁 Structured and maintainable codebase
- 🖼 Media/download command support
- 🧩 Easy command and event extension

---

## 📁 Project Structure

ARYAN-TELEGRAM-BOT/ ├── index.js                  # Entry point of the bot ├── config.json               # Stores bot token and config ├── package.json              # NPM dependencies and metadata

├── aryan/                    # Core logic & helpers │   ├── chat.js │   ├── listener.js │   ├── logger.js │   └── rateLimit.js

├── core/                     # Low-level bot internals │   ├── edit.js │   ├── load.js │   └── message.js

├── script/ │   └── commands/             # All user-accessible bot commands │       ├── admin.js │       ├── baby.js │       ├── cmd.js │       ├── downloader.js │       ├── eval.js │       ├── help.js │       ├── ping.js │       └── prefix.js

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js installed (v16+ recommended)
- A Telegram Bot token from [@BotFather](https://t.me/BotFather)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/itzaryan008/ARYAN-TELEGRAM-BOT.git
   cd ARYAN-TELEGRAM-BOT

2. Install dependencies

```
npm install
```

3. Configure your bot

Open config.json and add your Telegram bot token:

```
{
  "token": "YOUR_BOT_TOKEN"
}

```

4. Run the bot

```
node index


```

---

