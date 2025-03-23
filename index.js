require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
require('./models/index.js');

const commandLoader = require('./utils/CommandLoader.js');
const eventLoader = require('./utils/EventLoader.js');

// Create a new instance of the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,              // Permet d'accéder aux guildes
        GatewayIntentBits.GuildMessages,       // Permet d'accéder aux messages dans un serveur
        GatewayIntentBits.MessageContent,      // Permet d'obtenir le contenu complet des messages
        GatewayIntentBits.GuildMembers,        // Permet d'obtenir des informations sur les membres
    ],
});

// Load all commands
(async () => {

    await commandLoader.loadCommands(client);
    await eventLoader.loadEvents(client);

    await client.login(process.env.DISCORD_TOKEN);
})();
