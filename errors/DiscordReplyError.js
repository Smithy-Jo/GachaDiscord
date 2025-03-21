class DiscordReplyError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DiscordReplyError';
    }

    display(interaction) {
        if (interaction.deferred) {
            return interaction.editReply(this.message);
        } else {
            return interaction.reply(this.message);
        }
    }
}

module.exports = DiscordReplyError;
