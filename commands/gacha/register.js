const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const User = require('../../models/User')

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Crée un compte utilisateur.'),
    async execute(interaction) {
        const user_id = interaction.user.id;

        let user = await User.getUserById(user_id);
        if (user) {
            return interaction.reply("Vous avez déjà un compte.");
        }
        
        // Creation d'une modale pour demander l'email et le mot de passe
        const modal = new ModalBuilder()
            .setCustomId('registerModal')
            .setTitle('Enregistrement');

        // Create the text input components
        const emailInput = new TextInputBuilder()
            .setCustomId('emailInput')
            .setLabel("E-mail (Optionnel)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('exemple@gmail.com')
            .setMaxLength(255)
            .setRequired(false);

        const passwordInput = new TextInputBuilder()
            .setCustomId('passwordInput')
            .setLabel("Mot de passe (évitez votre principal)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(8)
            .setMaxLength(255);

        const confPasswordInput = new TextInputBuilder()
            .setCustomId('confPasswordInput')
            .setLabel("Confirmez le mot de passe")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(8)
            .setMaxLength(255);

        const firstActionRow = new ActionRowBuilder().addComponents(emailInput);
        const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(confPasswordInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        return interaction.showModal(modal);
    }
}