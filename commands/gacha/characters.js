const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User')

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('characters')
        .setDescription('Affiche les personnages d\'un joueur.'),
    async execute(interaction) {
        const user = await User.getUserById(interaction.user.id);
        if (!user) {
            await interaction.reply('Vous n\'avez pas de compte. Faites `/register` pour en créer un.');
            return;
        }

        const characters = await user.getCharacters();
        if (characters.length === 0) {
            await interaction.reply('Vous n\'avez pas de personnages. Faite `/invoc` pour en obtenir un.');
            return;
        }

        const characterList = characters.map(character => `**${character.name}** - Niveau ${character.level}`).join('\n');
    }
}