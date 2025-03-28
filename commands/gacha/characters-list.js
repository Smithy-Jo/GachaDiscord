const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User')

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('characters-list')
        .setDescription('Affiche les personnages d\'un joueur.'),
    async execute(interaction) {
        const user = await User.getUserLoadedById(interaction.user.id);
        if (!user) {
            return interaction.reply('Vous n\'avez pas de compte. Faites `/register` pour en créer un.');
        }

        if (user.characters.length === 0) {
            return interaction.reply('Vous n\'avez pas de personnages. Faite `/summon` pour en obtenir un.');
        }

        await interaction.reply(`${user.characters.length} personnages envoyés en message privé.`);
        await interaction.user.send({embeds: user.characters.map(character => character.generateEmbed())});
    }
}