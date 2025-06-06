const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // For loading environment variables

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Event: Bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event: Message received
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;
    
    const channelId = '1379019559616516217'; // Replace with the target channel ID
    const targetChannel = client.channels.cache.get(channelId);
    // Command to fetch data from a URL
    if (message.channel.id === channelId) {
        const minecraft_player = message.content;
        const discord_id = message.author.id;
        const discord_username = message.author.username;

        const user = message.author;
        const avatar_url = user.displayAvatarURL({ dynamic: true, size: 512 });
        //message.channel.send(`Here is your avatar: ${avatar_url}`);

        console.log(`Received message from ${discord_username} (${discord_id}): ${minecraft_player}`);
        try {
            const response = await fetch('http://192.168.0.29:8080/register', { // Example URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discord_username, discord_id,
                    minecraft_player, avatar_url })
            });
            const data = await response.json();
            message.react('✅');
            //message.reply(`Fetched data: ${JSON.stringify(data)}`);
        } catch (error) {
            console.error(error);
           // message.reply('Failed to fetch data from the URL.');
        }
    }
});
// Log in to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);