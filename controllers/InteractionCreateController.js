const { CommandNotFoundError, CooldownError } = require("../errors/CommandsErrors");
const ModalController = require('./ModalController');
const { Collection } = require('discord.js');

module.exports = {
    modalSubmitCtrl: async function (interaction) {
        if (interaction.customId === 'registerModal') {
            ModalController.register(interaction);
        } else if (interaction.customId === 'unregisterModal') {
            ModalController.unregister(interaction);
        }
    },

    chatInputCommandCtrl: async function (interaction) {

        // Verification si la commande existe
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            const error = new CommandNotFoundError(interaction.commandName);
            // console.error(error);
            return error.display(interaction);
        }

        // Verification du cooldown de la commande
        const defaultCooldownDuration = 3;
        const { cooldowns } = interaction.client;
        if (!cooldowns.has(command.data.name))
            cooldowns.set(command.data.name, new Collection());
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                const error = new CooldownError(command.data.name, expiredTimestamp);
                // console.error(error);
                return error.display(interaction);
            }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Execution de la commande
        return command.execute(interaction);
    }
} 