const { EmbedBuilder } = require('discord.js');
const drop_config = require('../config/drop.json');
const { cores, prefixes, suffixes, titlesByRarity } = require('../config/characterNames.json');
const BasicSkill = require('./BasicSkill');
const SpecialSkill = require('./SpecialSkill');
const UltimateSkill = require('./UltimateSkill');


class Character {

    static knex = null;

    constructor(parameters) {
        this.id = parameters.id ?? null;
        this.rarity = parameters.rarity ?? Character.generateRarity(parameters.user);
        this.name = parameters.name ?? Character.generateCharacterName(this.rarity);
        this.level = parameters.level ?? 1;
        this.xp = parameters.xp ?? 0;

        const stats_range = drop_config.rarity_rates[this.rarity].stats_range;
        this.hp = parameters.hp ?? Character.generateRandomStat(stats_range.hp.min, stats_range.hp.max);
        this.pwr = parameters.pwr ?? Character.generateRandomStat(stats_range.pwr.min, stats_range.pwr.max);
        this.def = parameters.def ?? Character.generateRandomStat(stats_range.def.min, stats_range.def.max);
        this.speed = parameters.speed ?? Character.generateRandomStat(stats_range.speed.min, stats_range.speed.max);
        this.dodge = parameters.dodge ?? Character.generateRandomStat(stats_range.dodge.min, stats_range.dodge.max) / 100;
        this.crit = parameters.crit ?? Character.generateRandomStat(stats_range.crit.min, stats_range.crit.max) / 100;
        this.element = parameters.element ?? ['fire', 'water', 'earth'][Math.floor(Math.random() * 3)];

        this.xpToNextLevel = parameters.xpToNextLevel ?? this.getXpRequirement();
        this.maxLevel = parameters.maxLevel ?? drop_config.rarity_rates[this.rarity].max_level;

        this.user = parameters.user ?? null;
        this.basicSkill = parameters.basicSkill ?? null;
        this.specialSkill = parameters.specialSkill ?? null;
        this.ultimateSkill = parameters.ultimateSkill ?? null;
    }

    static async create(user) {

        const character = new Character({ user });

        character.basicSkill = await BasicSkill.create(character);

        character.id = await Character.knex('characters').insert({
            user_id: character.user.id,
            rarity: character.rarity,
            name: character.name,
            level: character.level,
            xp: character.xp,
            hp: character.hp,
            pwr: character.pwr,
            def: character.def,
            speed: character.speed,
            dodge: character.dodge,
            crit: character.crit,
            element: character.element,
            basic_skill_id: character.basicSkill.id,
            special_skill_id: null,
            ultimate_skill_id: null
        });

        return character;
    }

    
    async save() {
        await Character.knex('characters').update({
            level: this.level,
            xp: this.xp,
            hp: this.hp,
            pwr: this.pwr,
            def: this.def,
            speed: this.speed,
            dodge: this.dodge,
            crit: this.crit,
            updated_at: new Date()
        }).where('id', this.id);
    }

    async gainXp(amount) {
        if (this.level >= this.maxLevel) return;

        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            await this.levelUp();
        }
    }

    getXpRequirement() {
        return Math.floor(100 * Math.pow(1.2, this.level - 1));
    }
    async levelUp() {
        this.xp -= this.xpToNextLevel;
        this.level++;
        this.xpToNextLevel = this.getXpRequirement();

        this.hp = Math.floor(this.hp * 1.1);
        this.pwr = Math.floor(this.pwr * 1.1);
        this.def = Math.floor(this.def * 1.1);
        this.speed = Math.floor(this.speed * 1.1);
        this.dodge = this.dodge + 0.05;
        this.crit = this.crit + 0.05;

        if (this.level % 10 === 0)
            await upgradeSkills();

        await this.save();
    }
    async upgradeSkills() {
        switch (this.level) {
            case 10:
                this.basicSkill.levelup(); // basicSkill.level = 2
                break;
            case 20:
                this.specialSkill = await SpecialSkill.create(this);
                break;
            case 30:
                this.specialSkill.levelup(); // specialSkill.level = 2
                break;
            case 40:
                this.ultimateSkill = await UltimateSkill.create(this);
                break;
            case 50:
                this.basicSkill.levelup(); // basicSkill.level = 3
                break;
            case 60:
                this.specialSkill.levelup(); // specialSkill.level = 3
                break;
            case 70:
                this.ultimateSkill.levelup(); // ultimateSkill.level = 2
                break;
            case 80:
                this.ultimateSkill.levelup(); // ultimateSkill.level = 3
                break;
        }

        this.basicSkill.upgrade();
        if (this.specialSkill) this.specialSkill.upgrade();
        if (this.ultimateSkill) this.ultimateSkill.upgrade();
    }

    static generateRarity(user) {
        const pity_system = drop_config.pity_system;
        if (user.legendary_pity >= pity_system.legendary_guarantee) return 'legendary';
        if (user.epic_pity >= pity_system.epic_guarantee) return 'epic';

        const roll = Math.random() * 100;
        let cumulativeChance = 0;
        for (const [rarity, data] of Object.entries(drop_config.rarity_rates)) {
            cumulativeChance += data.probability;
            if (roll <= cumulativeChance) return rarity;
        }
        return 'common';
    }

    static generateCharacterName(rarity) {
        const name = prefixes[Math.floor(Math.random() * prefixes.length)] +
            cores[Math.floor(Math.random() * cores.length)] +
            suffixes[Math.floor(Math.random() * suffixes.length)];

        const titleList = titlesByRarity[rarity];
        const title = titleList[Math.floor(Math.random() * titleList.length)];

        return `${name} ${title}`;
    }

    static generateRandomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateEmbed() {
        const embed = new EmbedBuilder()
            .setTitle(`🎭 Nouveau personnage obtenu !`)
            .setDescription(`**Nom : ${this.name}\nRareté : ${this.formatRarity()}**`)
            .setColor(this.getRarityColor())
            .addFields(
                { name: "❤️ PV", value: `${this.hp}`, inline: true },
                { name: "⚔️ PWR", value: `${this.pwr}`, inline: true },
                { name: "🛡️ DEF", value: `${this.def}`, inline: true },
                { name: "💨 Vitesse", value: `${this.speed}`, inline: true },
                { name: "🎯 Esquive", value: `${(this.dodge * 100).toFixed(1)}%`, inline: true },
                { name: "💥 Critique", value: `${(this.crit * 10).toFixed(1)}%`, inline: true }
            );

        // Ajout des compétences si elles existent
        if (this.basicSkill) {
            const field_value = this.basicSkill.effects.map(effect => `**${effect.name}**\n${effect.description}`).join('\n');
            embed.addFields(
                { name: "🔹 Compétence de base", value: field_value, inline: false }
            );
        }

        if (this.specialSkill) {
            const field_value = this.specialSkill.effects.map(effect => `**${effect.name}**\n${effect.description}`).join('\n');
            embed.addFields(
                { name: "✨ Compétence spéciale", value: field_value, inline: false }
            );
        }

        if (this.ultimateSkill) {
            const field_value = this.ultimateSkill.effects.map(effect => `**${effect.name}**\n${effect.description}`).join('\n');
            embed.addFields(
                { name: "🌀 Compétence ultime", value: field_value, inline: false }
            );
        }

        embed.setTimestamp();
        return embed;
    }


    formatRarity() {
        const emojis = {
            common: "⚪ Commun",
            rare: "🔵 Rare",
            epic: "🟣 Épique",
            legendary: "🟠 Légendaire"
        };
        return emojis[this.rarity] || this.rarity;
    }

    getRarityColor() {
        const colors = {
            common: 0xA0A0A0, // Gris
            rare: 0x0099FF, // Bleu
            epic: 0x800080, // Violet
            legendary: 0xFFA500 // Orange
        };
        return colors[this.rarity] || 0xFFFFFF; // Blanc par défaut
    }

}

module.exports = Character;
