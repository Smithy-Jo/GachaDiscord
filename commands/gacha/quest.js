const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');
const Character = require('../../models/Character');
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
                messages.filter(m => m.id !== message.id).forEach(m => m.delete()); // Supprime les autres messages
                let log = [`Vous avez lancé la quête :\n${description}`];
                message.edit({ content: log.join('\n'), components: [] });

                const enemy = Character.create(enemyObj);
                enemy.energy = 10;
                character.energy = 10;
                
                log.push(`🔥 Combat entre ${character.name} et ${enemy.name} commence !`);
                message.edit({ content: log.join('\n'), components: [] });
                while (character.hp > 0 && enemy.hp > 0) {
                  // Tour du joueur
                  let playerDamage;
                  if (player.energy >= player.skills[0].energy_cost) {
                    // Utilisation de la compétence
                    playerDamage = player.skills[0].damage;
                    player.energy -= player.skills[0].energy_cost;
                    log.push(`${player.name} utilise **${player.skills[0].name}** et inflige ${playerDamage} dégâts !`);
                  } else {
                    // Attaque normale
                    playerDamage = player.attack;
                    log.push(`${player.name} attaque et inflige ${playerDamage} dégâts.`);
                  }
                  enemy.hp -= Math.max(playerDamage - enemy.defense, 0);
              
                  if (enemy.hp <= 0) {
                    log.push(`🎉 ${enemy.name} est vaincu !`);
                    break;
                  }
              
                  // Tour de l’ennemi
                  let enemyDamage;
                  if (enemy.energy >= enemy.skills[0].energy_cost) {
                    enemyDamage = enemy.skills[0].damage;
                    enemy.energy -= enemy.skills[0].energy_cost;
                    log.push(`${enemy.name} utilise **${enemy.skills[0].name}** et inflige ${enemyDamage} dégâts !`);
                  } else {
                    enemyDamage = enemy.attack;
                    log.push(`${enemy.name} attaque et inflige ${enemyDamage} dégâts.`);
                  }
                  player.hp -= Math.max(enemyDamage - player.defense, 0);
              
                  if (player.hp <= 0) {
                    log.push(`💀 ${player.name} est vaincu...`);
                    break;
                  }
                }
              
                await interaction.reply(log.join('\n'));
            });
        }

    }
}