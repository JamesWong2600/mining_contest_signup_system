const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // For loading environment variables
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const https = require('https');

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
            /*const response = await fetch('https://www.easonmc.org:8080/register', { // Example URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discord_username, discord_id,
                    minecraft_player, avatar_url })
            });*/
            const postData = JSON.stringify({
                discord_username,
                discord_id,
                minecraft_player,
                avatar_url,
            });

            const options = {
            hostname: process.env.HOSTNAME,
            port: process.env.PORT,
            path: '/register',
            method: 'POST',
            headers: {
                'Content-Length': postData.length,
              },
             agent: new https.Agent({
                rejectUnauthorized: false, // Allow self-signed certificates
            }),
           };

            const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                //console.log('Response from server:', JSON.parse(data));
                message.react('✅');
            });
            });

            req.on('error', (error) => {
            console.error('Error fetching data:', error);
            message.reply('Failed to fetch data from the server.');
            });

            req.write(postData);
            req.end();
            /*console.log('Response from server:', response.data);
            //const data = await response.json();
            message.react('✅');
            //message.reply(`Fetched data: ${JSON.stringify(data)}`);
        } catch (error) {
            console.error(error);
           // message.reply('Failed to fetch data from the URL.');
        }*/
   }
});
// Log in to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);