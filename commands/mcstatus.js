const axios = require("axios");

const MINECRAFT_SERVER = process.env.MINECRAFT_SERVER;

async function getMinecraftStatus() {
  try {
    const url = `https://api.mcsrvstat.us/2/${MINECRAFT_SERVER}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.online) {
      return `🚫 The Minecraft server **${MINECRAFT_SERVER}** is currently **offline**.`;
    }

    return `✅ The Minecraft server **${MINECRAFT_SERVER}** is **online**!
- **IP:** ${MINECRAFT_SERVER}
- **Players:** ${data.players.online}/${data.players.max}
- **Version:** ${data.version}
- **MOTD:** ${data.motd.clean.join("\n")}`;
  } catch (error) {
    console.error("❌ Minecraft API error:", error);
    return "⚠️ Failed to fetch Minecraft server status.";
  }
}

module.exports = { getMinecraftStatus };
