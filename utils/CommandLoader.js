require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes, Collection } = require('discord.js');

module.exports = {

    // Construct and prepare an instance of the REST module
    rest: new REST().setToken(process.env.DISCORD_TOKEN),

    // Load all commands in a collection
    loadCommands: async function (client) {
        // Add the commands and cooldowns collection to the client
        client.commands = new Collection();
        client.cooldowns = new Collection();

        // Load all commands
        const foldersPath = path.join(__dirname, '..', 'commands');
        console.log(`[INFO] Loading commands from ${foldersPath}`);
        // const commandFolders = fs.readdirSync(foldersPath);
        const commandFolders = fs.readdirSync(foldersPath);
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command && "category" in command) {
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data", "category" or "execute" property.`);
                }
            }
        }
        // Deploy commands to Discord
        return this.rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
            { body: client.commands.map(command => command.data.toJSON()) },
        )
            .then((reqponse) => console.log(`[INFO] Successfully deployed ${reqponse.length}`))
            .catch(error => console.error(`[ERROR] Failed to deploy commands to guild `, error));
    },

};
