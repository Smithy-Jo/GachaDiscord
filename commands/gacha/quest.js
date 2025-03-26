const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User')

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Affiche les quêtes disponibles.')
        .addNumberOption(option =>
            option.setName('identifiant')
                .setDescription('Identifiant du personnage.')
                .setRequired(true)
				.setAutocomplete(true)),
	async autocomplete(interaction) {
        const user = await User.getUserById(interaction.user.id);
        const characters = await user.getCharacters();
		const focusedValue = interaction.options.getFocused();

		const choices = characters.map(character => character.id);
		const filtered = choices.filter(choice => choice.toString().includes(focusedValue.toString()));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction) {
        // Créer un tableau de quêtes
        const quests = [
            { name: 'Chasser des rats', description: 'Tuez 5 rats dans la forêt.', level: 1 },
            { name: 'Protéger le village', description: 'Défendez le village contre les pillards.', level: 2 },
            { name: 'Le dragon des montagnes', description: 'Tuez le dragon des montagnes.', level: 10 }
        ];

        // Pour chaque quête, envoyer un message avec un bouton "Select"
        for (const quest of quests) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`quest_${quest.level}`)
                        .setLabel('Select')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.user.send({
                content: `**Quête : ${quest.name}**\nDescription : ${quest.description}\nNiveau : ${quest.level}`,
                components: [row],
            });

        }
    }
}