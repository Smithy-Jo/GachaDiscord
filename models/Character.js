const { EmbedBuilder } = require('discord.js');
const configDrop = require('../config/drop.json');
const { cores, prefixes, suffixes, titlesByRarity } = require('../config/characterNames.json');
const BasicSkill = require('./BasicSkill');
const SpecialSkill = require('./SpecialSkill');
const UltimateSkill = require('./UltimateSkill');


class Character {

    static knex = null;

    constructor(parameters) {
        this.id = parameters.id ?? null;
        this.user = parameters.user ?? null;
        this.rarity = parameters.rarity ?? Character.generateRarity(parameters.user);
        this.name = parameters.name ?? Character.generateCharacterName(this.rarity);
        this.level = parameters.level || 1;
        this.xp = parameters.xp || 0;

        const stats_range = configDrop.rarity_rates[this.rarity].stats_range;
        this.hp = parameters.hp ?? Character.generateRandomStat(stats_range.hp.min, stats_range.hp.max);
        this.pwr = parameters.pwr ?? Character.generateRandomStat(stats_range.pwr.min, stats_range.pwr.max);
        this.def = parameters.def ?? Character.generateRandomStat(stats_range.def.min, stats_range.def.max);
        this.speed = parameters.speed ?? Character.generateRandomStat(stats_range.speed.min, stats_range.speed.max);
        this.dodge = parameters.dodge ?? Character.generateRandomStat(stats_range.dodge.min, stats_range.dodge.max) / 100;
        this.crit = parameters.crit ?? Character.generateRandomStat(stats_range.crit.min, stats_range.crit.max) / 100;
        this.element = parameters.element ?? ['fire', 'water', 'earth'][Math.floor(Math.random() * 3)];

        this.xpToNextLevel = parameters.xpToNextLevel ?? this.getXpRequirement();
        this.maxLevel = parameters.maxLevel ?? this.getMaxLevel();

        this.basicSkill = parameters.basicSkill || null;
        this.specialSkill = parameters.specialSkill || null;
        this.ultimateSkill = parameters.ultimateSkill || null;
    }

    static async invoc(user) {

        const character = new Character({
            user,
        });

        character.basicSkill = await BasicSkill.create(character.element, character.pwr, character.rarity);

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

    getMaxLevel() {
        const rarityLevels = {
            "common": 20,
            "rare": 40,
            "epic": 60,
            "legendary": 80
        };
        return rarityLevels[this.rarity];
    }
    getXpRequirement() {
        return Math.floor(100 * Math.pow(1.2, this.level - 1));
    }
    // Ajouter de l'XP et gérer la montée de niveau
    gainXp(amount) {
        if (this.level >= this.maxLevel) return;

        this.xp += amount;
        while (this.xp >= this.xpToNextLevel && this.level < this.maxLevel) {
            this.levelUp();
        }
    }
    levelUp() {
        this.xp -= this.xpToNextLevel;
        this.level++;
        this.xpToNextLevel = this.getXpRequirement();
        this.unlockSkills();
        console.log(`${this.name} passe au niveau ${this.level} !`);
    }

    static generateRarity(user) {
        const pity_system = configDrop.pity_system;
        if (user.legendary_pity >= pity_system.legendary_guarantee) return 'legendary';
        if (user.epic_pity >= pity_system.epic_guarantee) return 'epic';

        const roll = Math.random() * 100;
        let cumulativeChance = 0;
        for (const [rarity, data] of Object.entries(configDrop.rarity_rates)) {
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
