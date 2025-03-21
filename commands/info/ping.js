const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'info',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec Pong !'),
    async execute(interaction) {
        const start = Date.now(); // Temps avant la réponse
        await interaction.deferReply();

        // Calcul de la latence
        const latency = Date.now() - start;

        // Réponse avec l'embed
        return interaction.editReply(
            "**🏓 Pong!**" + 
            `\n🕒 Latence de la commande: **${latency}ms**` +
            `\n🕒 Latence du l’API: **${Math.round(interaction.client.ws.ping)}ms**`
        );
    }
};