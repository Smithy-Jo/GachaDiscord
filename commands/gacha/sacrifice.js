const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');
const Character = require('../../models/Character');

module.exports = {
    category: 'gacha',
    data: new SlashCommandBuilder()
        .setName('sacrifice')
        .setDescription("Sacrifie un personnage en échange d'or ou d'XP."),
    async execute(interaction) {
        const user = await User.getUserLoadedById(interaction.user.id);

        if (!user.characters.length) {
            return interaction.reply({ content: "Tu n'as aucun personnage à sacrifier." });
        }

        await interaction.reply({ content: "Je t'envoie un message privé pour choisir le personnage à sacrifier." });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('sacrifice_select')
            .setPlaceholder('Choisis un personnage à sacrifier')
            .addOptions(
                user.characters.map(char => ({
                    label: `${char.name} ${char.formatRarity()} (Niv. ${char.level})`,
                    value: char.id.toString()
                })).slice(0, 10) // Limite à 25 options
            ).setMinValues(1)
            .setMaxValues(user.characters.length > 10 ? 10 : user.characters.length); // Limite à 25 sélections max

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const response = await interaction.user.send({ content: "Sélectionne un personnage :", components: [row] });

        // Collecteur pour récupérer la sélection
        const filter = i => i.user.id === user.id;
        const collector = response.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            let embeds = [];
            let totalGoldReward = 0;
            for (const characterId of i.values) {
                const character = user.characters.find(c => c.id.toString() === characterId);

                if (!character) {
                    return i.reply({ content: `Personnage introuvable. id:${characterId}` });
                }
                let goldReward = 0;
                if (character.rarity === 'rare') {
                    goldReward = character.level * 150;
                } else if (character.rarity === 'epic') {
                    goldReward = character.level * 200;
                } else if (character.rarity === 'legendary') {
                    goldReward = character.level * 250;
                } else { // Commun
                    goldReward = character.level * 100;
                }
                embeds.push(
                    character.generateEmbed()
                        .addFields(
                            { name: 'Sacrifice', value: `Tu recevras 💰 ${goldReward} pièces d'or.` }
                        )
                );
                totalGoldReward += goldReward;
            }

            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_sacrifice')
                .setLabel('Confirmer le sacrifice')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_sacrifice')
                .setLabel('Annuler le sacrifice')
                .setStyle(ButtonStyle.Secondary);

            const buttonRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
            await i.reply({ embeds, components: [buttonRow] });

            // Collecteur pour les boutons de confirmation/annulation
            const buttonCollector = i.channel.createMessageComponentCollector({ filter, time: 30000 });

            buttonCollector.on('collect', async btnInteraction => {
                if (btnInteraction.customId === 'confirm_sacrifice') {
                    for (const characterId of i.values) {
                        const character = user.characters.find(c => c.id.toString() === characterId);
                        if (character) {
                            await character.delete();
                        }
                    }
                    await user.addGold(totalGoldReward);

                    await btnInteraction.update({
                        content: `✅ **${i.values.length}** personnages ont étés sacrifiés ! Tu as gagné 💰 ${totalGoldReward} pièces d'or !`,
                        components: [],
                        embeds: []
                    });
                } else {
                    await btnInteraction.update({
                        content: "❌ Sacrifice annulé.",
                        components: [],
                        embeds: []
                    });
                }
            });
        });
    }
};
