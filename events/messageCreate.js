const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.guild === null && !message.author.bot) {
            await message.reply('Merci pour votre message !\nJe ne prend pas encore en charge les messages privés.');
        }
    }
};
