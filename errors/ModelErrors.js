const DiscordReplyError = require('./DiscordReplyError');

class MissingDatabaseInstance extends DiscordReplyError {
    constructor() {
        super("Database instance not initialized");
        this.name = 'MissingDatabaseInstance';
    }
}


module.exports = {
    MissingDatabaseInstance
}