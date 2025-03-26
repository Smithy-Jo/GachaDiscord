const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const User = require('../../models/User')

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Affiche les quêtes disponibles.'),
    async execute(interaction) {
        interaction.reply('En cours de developpement...');
        return;
        // Créer un tableau de quêtes
        const quests = [
            { name: 'Chasser des rats', description: 'Tuez 5 rats dans la forêt.', level: 1 },
            { name: 'Protéger le village', description: 'Défendez le village contre les pillards.', level: 2 },
            { name: 'Le dragon des montagnes', description: 'Tuez le dragon des montagnes.', level: 10 }
        ];

        // Pour chaque quête, envoyer un message avec un bouton "Select"
        for (const quest of quests) {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`select_quest_${quest.level}`)
                        .setLabel('Select')
                        .setStyle('PRIMARY')
                );

            await interaction.reply({
                content: `**Quête : ${quest.name}**\nDescription : ${quest.description}\nNiveau : ${quest.level}`,
                components: [row],
            });

            // Optionnel : tu peux ajouter un délai entre chaque message pour éviter l'envoi trop rapide
            await new Promise(resolve => setTimeout(resolve, 500)); // Attendre 500ms entre les messages
        }
    }
}