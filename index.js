require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { getGeminiResponse } = require("./commands/gemini");
const { getMinecraftStatus } = require("./commands/mcstatus");
const fs = require("fs");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

const SESSIONS_FILE = "./sessions.json";
let sessions = {};

// Load existing sessions from file
if (fs.existsSync(SESSIONS_FILE)) {
  try {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8"));
  } catch (error) {
    console.error("⚠️ Error loading session data:", error);
  }
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const query = message.content.trim();

  // Handle "!clear" command (no mention needed)
  if (query.toLowerCase() === "!clear") {
    delete sessions[userId];
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    return message.reply(`✅ Your conversation history has been cleared.`);
  }

  // Bot will only respond if mentioned
  if (!message.mentions.has(client.user)) return;

  const cleanedQuery = query.replace(`<@${client.user.id}>`, "").trim();

  // Initialize session if it doesn't exist
  if (!sessions[userId]) {
    sessions[userId] = [];
  }

  // Show "Bot is typing..."
  message.channel.sendTyping();

  let response;

  if (cleanedQuery.toLowerCase().includes("server status")) {
    response = await getMinecraftStatus();
  } else {
    response = await getGeminiResponse(userId, cleanedQuery, sessions[userId]);
  }

  // Save session (only keeping the last 10 interactions per user to save space)
  sessions[userId].push({ user: cleanedQuery, bot: response });
  if (sessions[userId].length > 10) {
    sessions[userId].shift(); // Remove the oldest message if more than 10
  }

  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

  // Ensure bot only mentions the actual user and no extra placeholders
  message.reply(`${response}`);
});

client.login(process.env.DISCORD_TOKEN);
