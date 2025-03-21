const DiscordReplyError = require("./DiscordReplyError");

class CommandNotFoundError extends DiscordReplyError {
    constructor(commandName) {
        super(`Commande inconnue : ${commandName}`);
        this.name = "CommandNotFoundError";
    }
}

class CooldownError extends DiscordReplyError {
    constructor(commandName, timeLeft) {
        super(`La commande "${commandName}" est en cooldown. Réessaie <t:${timeLeft}:R>.`);
        this.name = "CooldownError";
    }
}

class MissingPermissionError extends DiscordReplyError {
    constructor(permissions) {
        super(`Permission(s) manquante(s) : ${permissions.join(', ')}`);
        this.name = "MissingPermissionError";
    }
}

module.exports = { CommandNotFoundError, CooldownError, MissingPermissionError };