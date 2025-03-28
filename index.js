require('dotenv').config();
const { initializeDatabase } = require('./models/index.js');

const { Client, GatewayIntentBits } = require('discord.js');

const commandLoader = require('./utils/CommandLoader.js');
const eventLoader = require('./utils/EventLoader.js');

// Create a new instance of the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,              // Permet d'accéder aux guildes
        GatewayIntentBits.GuildMessages,       // Permet d'accéder aux messages dans un serveur
        GatewayIntentBits.DirectMessages,      // Permet de recevoir des DMs
        GatewayIntentBits.MessageContent,      // Permet d'obtenir le contenu complet des messages
        GatewayIntentBits.GuildMembers,        // Permet d'obtenir des informations sur les membres
    ],
});

// Load all commands
(async () => {
    // Initialize the database connection
    await initializeDatabase();

    // Chargement des commandes et des événements
    await commandLoader.loadCommands(client);
    await eventLoader.loadEvents(client);

    // Connection au client Discord
    await client.login(process.env.DISCORD_TOKEN);

})();
