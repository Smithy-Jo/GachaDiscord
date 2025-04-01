const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const Character = require('../../models/Character');
const User = require('../../models/User');

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('summon')
        .setDescription('Invoque un personnage.'),
    async execute(interaction) {
        const user = await User.getUserById(interaction.user.id);

        if (!user) {
            return interaction.reply("Vous n'avez pas de compte. Faites `/register` d'abord !");
        }
        if (user.balance < 100) {
            return interaction.reply("Vous n'avez pas assez de pièces pour invoquer !");
        }

        // Creer un message avec btn pour invoquer x1 ou x10
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_summon_1')
                    .setLabel('1x')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('btn_summon_10')
                    .setLabel('10x')
                    .setStyle(ButtonStyle.Primary),
            );

        const message = await interaction.reply({
            content: `${interaction.user.username}. Combien voulez-vous invoquer ?`,
            components: [row],
        });
        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 20_000, // 20 secondes pour répondre
        });

        collector.on('collect', async i => {
            let characters = [];
            if ((i.customId === 'btn_summon_1' && user.balance < 100) || (i.customId === 'btn_summon_10' && user.balance < 1000)) {
                return i.update({ content: 'Vous n\'avez pas assez de pièces pour invoquer !', components: [] });

            } else if (i.customId === 'btn_summon_1') {
                const character = Character.create({ user });
                await character.save();
                user.balance -= 100;
                user.updatePitySystem(character.rarity);
                await user.save();
                characters = [character];

            } else if (i.customId === 'btn_summon_10') {
                for (let i = 0; i < 10; i++) {
                    const character = Character.create({ user });
                    await character.save();
                    characters.push(character);
                    user.updatePitySystem(character.rarity);
                }
                user.balance -= 1000;
                await user.save();
            }

            // Envoie du recap du ou des personnages invoqués dans le chat
            await i.update({
                content: `${i.user.username} a invoqué ${characters.length} personnage(s) !\n\n` +
                    characters.map(character => `${character.name} ${character.formatRarity()}`).join('\n'),
                components: []
            });
            // Envoie des details du ou des personnage(s) dans un message privé à l'utilisateur
            try {
                await interaction.user.send({
                    content: `Vous avez invoqué ${characters.length} personnage(s) !`,
                    embeds: characters.map(character => character.generateEmbed())
                });
            }
            catch (error) {
                await interaction.followUp('Impossible de vous envoyer les détails des personnages en message privé.\n' +
                    'Verifiez vos paramètres de confidentialité.\nOu contactez un administrateur.'
                );
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