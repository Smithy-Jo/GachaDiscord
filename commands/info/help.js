// commands/helpl.js
const { SlashCommandBuilder, ContextMenuCommandBuilder } = require('discord.js');

// Mapping pour convertir le type d'option en chaîne de caractères
const optionTypeMap = {
    1: 'Sous-commande',
    2: 'Groupe de sous-commandes',
    3: 'Chaîne de caractères',
    4: 'Entier',
    5: 'Booléen',
    6: 'Utilisateur',
    7: 'Salon',
    8: 'Rôle',
    9: 'Mentionnable',
    10: 'Nombre',
    11: 'Fichier'
};

module.exports = {
    category: 'info',
    data: new SlashCommandBuilder()
        .setName('gacha-help')
        .setDescription('Affiche l\'aide des commandes disponibles'),
    async execute(interaction) {
        await interaction.deferReply();
        let helpMessage = '***Liste des commandes disponibles :***\n';

        interaction.client.commands.forEach(command => {

            if (command.data instanceof SlashCommandBuilder) {
                const commandJSON = command.data.toJSON();
                helpMessage += `\n\`/${commandJSON.name}\`: **${commandJSON.description}**\n`;

                if (commandJSON.options && commandJSON.options.length) {
                    helpMessage += '   *Options possibles :*\n';
                    commandJSON.options.forEach(option => {

                        const optionType = optionTypeMap[option.type] || `Type ${option.type}`;
                        helpMessage += `        \`${option.name}\` (${optionType}) : ${option.description}\n`;
                    });
                }
            }

        });

        await interaction.editReply({ content: helpMessage, ephemeral: true });
    },
};
