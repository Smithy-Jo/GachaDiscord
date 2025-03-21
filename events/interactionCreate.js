const { chatInputCommandCtrl, modalSubmitCtrl } = require('../controllers/InteractionCreateController');
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        // Check if the interaction is a command
        if (interaction.isChatInputCommand()) {
            try {
                await chatInputCommandCtrl(interaction);
            } catch (error) {
                console.error('There was an error while executing chatInputCommandCtrl! ', error);
                // interaction.reply('There was an error while executing this command!');
            }
        }

        // Check if the interaction is an autocomplete
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error('There was an error while executing isAutocomplete! ', error);
            }
        }

        // Check if the interaction a modal submit
        else if (interaction.isModalSubmit()) {
            try {
                await modalSubmitCtrl(interaction);
            } catch (error) {
                console.error('There was an error while executing modalSubmitCtrl! ', error);
                interaction.send('There was an error while receiving this command!');
            }
        }

        // Check if the interaction is a user context menu command
        else if (interaction.isUserContextMenuCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await chatInputCommandCtrl(interaction);
            } catch (error) {
                console.error('There was an error while executing chatInputCommandCtrl! ', error);
                // interaction.send('There was an error while executing this command!');
            }
        }
    }
};