const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { User } = require('../../models');

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Supprime votre compte utilisateur.'),

    async execute(interaction) {
        const user_id = interaction.user.id;

        let user = await User.getUserById(user_id);
        if (!user) {
            return interaction.reply("Vous n'avez pas de compte.");
        }

        const modal = new ModalBuilder()
            .setCustomId('unregisterModal')
            .setTitle('Suppression de compte');

        const passwordInput = new TextInputBuilder()
            .setCustomId('passwordInput')
            .setLabel("Tapper votre mot de passe pour confirmer")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(8)
            .setMaxLength(255);

        const ActionRow = new ActionRowBuilder().addComponents(passwordInput);

        modal.addComponents(ActionRow);

        return interaction.showModal(modal);
    }
};
