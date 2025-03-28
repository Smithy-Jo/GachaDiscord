const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');
const Character = require('../../models/Character');
const Quest = require('../../models/Quest');
const { templates, enemies, locations, items, npcs } = require('../../config/quests.json');

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Affiche les quêtes disponibles.')
        .addStringOption(option =>
            option.setName('personnage')
                .setDescription('Nom du personnage.')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const user = await User.getUserById(interaction.user.id);
        const characters = await user.getCharacters();
        const focusedValue = interaction.options.getFocused();

        let choices = characters.filter(character => character.name.toLowerCase().includes(focusedValue.toLowerCase()));

        // Discord limite à 25 résultats
        choices = choices.slice(0, 25);

        await interaction.respond(
            choices.map(choice => ({ name: choice.name, value: choice.id.toString() })),
        );
    },
    async execute(interaction) {
        const user = await User.getUserById(interaction.user.id);
        if (!user) {
            return interaction.reply({ content: 'Vous devez d\'abord vous enregistrer avec `/register`.', ephemeral: true });
        }

        const characterId = parseInt(interaction.options.getString('personnage'), 10);

        const character = await Character.getCharacterLoadedById(characterId);
        if (!character) {
            return interaction.reply({ content: 'Ce personnage ne vous appartient pas ou n\'existe pas', ephemeral: true });
        }

        const enemiesFiltered = enemies.filter(enemy => enemy.level <= character.level + 5 && enemy.level >= character.level - 5);

        for (let i = 0; i < enemiesFiltered.length; i++) {
            const enemy = enemiesFiltered[i];
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`quest_${i}`)
                        .setLabel('Lancer la quête')
                        .setStyle(ButtonStyle.Primary),
                );

            let description = getRandomElement(templates);
            // Remplace les placeholders par des valeurs aléatoires correspondantes
            if (description.includes("{enemy}"))
                description = description.replace(/{enemy}/g, `${enemy.name} ${enemy.rarity} (Niv. ${enemy.level})`);
            if (description.includes("{location}"))
                description = description.replace(/{location}/g, getRandomElement(locations));
            if (description.includes("{item}"))
                description = description.replace(/{item}/g, getRandomElement(items));
            if (description.includes("{npc}"))
                description = description.replace(/{npc}/g, getRandomElement(npcs));

            await interaction.user.send({ content: description, components: [row] });


        }

    }
}