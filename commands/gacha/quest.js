const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');
const Character = require('../../models/Character');
const PvECombat = require('../../controllers/PVECombat');
const { templates, enemies, locations, items, npcs } = require('../../config/quests.json');

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function calculateXP(enemy) {
    const baseXP = enemy.level * 10; // XP de base en fonction du niveau
    const rarityMultipliers = {
        common: 1,
        rare: 1.5,
        epic: 2,
        legendary: 3
    };
    const multiplier = rarityMultipliers[enemy.rarity] || 1;
    return Math.round(baseXP * multiplier);
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


        let choices = characters.filter(character =>
            `${character.name.toLowerCase()} ${character.rarity} ${character.level}`
                .includes(focusedValue.toLowerCase())
        );

        // Discord limite à 25 résultats
        choices = choices.slice(0, 25);

        await interaction.respond(
            choices.map(choice => ({ 
                name: `${choice.name.toLowerCase()} | rareté: ${choice.rarity} | level: ${choice.level}`, 
                value: choice.id.toString() 
            })),
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
        await interaction.reply({ content: `Vous avez ${enemiesFiltered.length} quêtes disponibles.` });

        let collectors = [];
        let messages = [];
        for (let i = 0; i < enemiesFiltered.length; i++) {
            const enemyObj = enemiesFiltered[i];
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`quest_${i}`)
                        .setLabel('Lancer la quête')
                        .setStyle(ButtonStyle.Primary),
                );

            let description = getRandomElement(templates);
            if (description.includes("{enemy}"))
                description = description.replace(/{enemy}/g, `${enemyObj.name} ${enemyObj.rarity} (Niv. ${enemyObj.level})`);
            if (description.includes("{location}"))
                description = description.replace(/{location}/g, getRandomElement(locations));
            if (description.includes("{item}"))
                description = description.replace(/{item}/g, getRandomElement(items));
            if (description.includes("{npc}"))
                description = description.replace(/{npc}/g, getRandomElement(npcs));

            const message = await interaction.user.send({ content: description, components: [row] });
            messages.push(message);
            const collector = message.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60_000,
            });
            collectors.push(collector);

            // Debut de la quête
            collector.on('collect', async i => {
                collectors.forEach(collector => collector.stop());
                await Promise.all(messages.filter(m => m.id !== message.id).map(m => m.delete())); // Supprime les autres messages

                const enemy = Character.create(enemyObj);
                const pveCombat = new PvECombat(character, enemy, message);
                await pveCombat.log(`-----------------------------------------------`);
                await pveCombat.log(`Vous avez lancé la quête :\n${description}`);
                const winner = await pveCombat.start();
                if (winner === character) {
                    const Exp = calculateXP(enemy);
                    await pveCombat.log(`${character.name} à gagné ${Exp} XP !`);
                    const level = character.gainXp(Exp)
                    await pveCombat.log(`${character.name} est maintenant niveau ${level} !`);
                    await character.save()
                }
            });
        }

    }
}