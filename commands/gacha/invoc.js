const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const Character = require('../../models/Character');
const User = require('../../models/User');

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('invoc')
        .setDescription('Invoque un personnage.'),
    async execute(interaction) {
        const userModelInstance = await User.getUserById(interaction.user.id);

        if (!userModelInstance) {
            return interaction.reply("Vous n'avez pas de compte. Faites `/register` d'abord !");
        }

        // Creer un message avec btn pour invoquer x1 ou x10
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_invoc_1')
                    .setLabel('1x')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('btn_invoc_10')
                    .setLabel('10x')
                    .setStyle(ButtonStyle.Primary),
            );

        const message = await interaction.reply({
            content: `Vous avez ${userModelInstance.balance} pièces. Combien voulez-vous invoquer ?`,
            components: [row],
        });
        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 20_000, // 20 secondes pour répondre
        });

        collector.on('collect', async i => {

            if ((i.customId === 'btn_invoc_1' && userModelInstance.balance < 100) || (i.customId === 'btn_invoc_10' && userModelInstance.balance < 1000)) {
                await i.update({ content: 'Vous n\'avez pas assez de pièces pour invoquer !', components: [] });

            } else if (i.customId === 'btn_invoc_1') {
                const character = await Character.invoc(userModelInstance);
                userModelInstance.balance -= 100;
                userModelInstance.updatePitySystem(character.rarity);
                await userModelInstance.save();
                await i.update({ content: '', components: [], embeds: [character.generateEmbed()] });

            } else if (i.customId === 'btn_invoc_10') {
                // Invocation de 10 personnages
                let characters = [];
                for (let i = 0; i < 10; i++) {
                    const character = await Character.invoc(userModelInstance);
                    characters.push(character);
                    userModelInstance.updatePitySystem(character.rarity);
                }
                userModelInstance.balance -= 1000;
                await userModelInstance.save();
                // Envoie des 10 personnages dans le chanel de l'interaction
                await i.update({
                    content: `${i.user.username} a invoqué 10 personnages !\n\n` +
                        characters.map(character => `${character.name} ${character.formatRarity()}`).join('\n'),
                    components: []
                });
                // Envoie des details des 10 personnages dans un message privé à l'utilisateur
                try {
                    await interaction.user.send({
                        content: `Vous avez invoqué 10 personnages !`,
                        embeds: characters.map(character => character.generateEmbed())
                    });
                }
                catch (error) {
                    await interaction.followUp('Impossible de vous envoyer les détails des personnages en message privé.');
                }

            }

            collector.stop();
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await message.edit({ content: "⏳ Temps écoulé, vous n'avez pas fait de choix.", components: [] });
            }
        });
    }
}