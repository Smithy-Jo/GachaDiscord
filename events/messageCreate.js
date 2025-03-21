const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(interaction) {
        if (interaction.author.bot) return;
        console.log('Un message à été recu ',interaction.content);
    }
};