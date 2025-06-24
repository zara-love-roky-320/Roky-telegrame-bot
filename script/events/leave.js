module.exports = {
  name: "leave",
  author: "ArYAN",
  version: "0.0.1",
  description: "Notifies when a user leaves the group.",
  async handleEvent({ chat, msg }) {
    if (msg.left_chat_member) {
      const leftMember = msg.left_chat_member;
      const userName = leftMember.first_name || "Someone";
      const mention = leftMember.username ? `@${leftMember.username}` : userName;

      let farewellMessage;
      if (leftMember.id.toString() === chat.userId) {
        farewellMessage = "It seems I have been removed from the group. Goodbye!";
      } else {
        farewellMessage = `Goodbye, ${mention}! We will miss you.`;
      }
      
      await chat.reply(farewellMessage);
      console.log(`${userName} (ID: ${leftMember.id}) left chat ${msg.chat.id}`);
    }
  },
};
