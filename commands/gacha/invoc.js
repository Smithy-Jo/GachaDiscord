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

        try {
            // Envoi du message privé avec les boutons
            const dmChannel = await interaction.user.createDM();
            const message = await dmChannel.send({
                content: `Vous avez ${userModelInstance.balance} pièces. Combien voulez-vous invoquer ?`,
                components: [row],
            });

            await interaction.reply(`${interaction.user.username}, je vous ai envoyé un message privé !`);

            // Création du collector pour écouter les interactions des boutons
            const collector = message.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000, // 1 minute pour répondre
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
                    let characters = [];
                    for (let i = 0; i < 10; i++) {
                        const character = await Character.invoc(userModelInstance);
                        characters.push(character);
                        userModelInstance.updatePitySystem(character.rarity);
                    }
                    userModelInstance.balance -= 1000;
                    await userModelInstance.save();
                    await i.update({ content: '', components: [], embeds: characters.map(character => character.generateEmbed()) });
                }

                collector.stop();
            });

            collector.on('end', async collected => {
                if (collected.size === 0) {
                    await message.edit({ content: "⏳ Temps écoulé, vous n'avez pas fait de choix.", components: [] });
                }
            });


        } catch (error) {
            console.error(error);
            if (interaction.replied)
                return interaction.editReply(`${interaction.user.username}, je n'ai pas pu vous envoyer de message privé.\nVeuillez vérifier vos paramètres de confidentialité.\nContatez un administrateur si le problème persiste.`);
            else
                return interaction.reply(`${interaction.user.username}, je n'ai pas pu vous envoyer de message privé.\nVeuillez vérifier vos paramètres de confidentialité.\nContatez un administrateur si le problème persiste.`);
        }
    }
}