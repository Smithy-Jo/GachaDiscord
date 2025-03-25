const { EmbedBuilder } = require('discord.js');
const configDrop = require('../config/drop.json');
const { cores, prefixes, suffixes, titlesByRarity } = require('../config/characterNames.json');
const BasicSkill = require('./BasicSkill');
const SpecialSkill = require('./SpecialSkill');
const UltimateSkill = require('./UltimateSkill');

class Character {

    static knex = null;

    constructor(parameters) {
        this.id = parameters.id;
        this.user_id = parameters.user_id;
        this.name = parameters.name;
        this.rarity = parameters.rarity;
        this.level = parameters.level || 1;
        this.xp = parameters.xp || 0;
        this.hp = parameters.hp;
        this.pwr = parameters.pwr;
        this.def = parameters.def;
        this.speed = parameters.speed;
        this.dodge = parameters.dodge;
        this.crit = parameters.crit;
        this.element = parameters.element;
        this.basicSkill = parameters.basicSkill || null;
        this.specialSkill = parameters.specialSkill || null;
        this.ultimateSkill = parameters.ultimateSkill || null;
    }

    static async invoc(user) {
        const rarity = this.generateRarity(user);
        const name = this.generateCharacterName(rarity);

        const stats_range = configDrop.rarity_rates[rarity].stats_range;
        const hp = this.generateRandomStat(stats_range.hp.min, stats_range.hp.max);
        const pwr = this.generateRandomStat(stats_range.pwr.min, stats_range.pwr.max);
        const def = this.generateRandomStat(stats_range.def.min, stats_range.def.max);
        const speed = this.generateRandomStat(stats_range.speed.min, stats_range.speed.max);
        const dodge = this.generateRandomStat(stats_range.dodge.min, stats_range.dodge.max) / 100;
        const crit = this.generateRandomStat(stats_range.crit.min, stats_range.crit.max) / 10;
        const element = ['fire', 'water', 'earth'][Math.floor(Math.random() * 3)];

        const basicSkill = await BasicSkill.create(element, pwr, rarity);
        let specialSkill = null;
        let ultimateSkill = null;
        if (rarity === 'rare') {
            specialSkill = await SpecialSkill.create(element, pwr, rarity);
        } else if (rarity === 'legendary' || rarity === 'epic') {
            specialSkill = await SpecialSkill.create(element, pwr, rarity);
            ultimateSkill = await UltimateSkill.create(element, pwr, rarity);
        }

        const character_id = await Character.knex('characters').insert({
            user_id: user.id,
            name,
            rarity,
            hp,
            pwr,
            def,
            speed,
            dodge,
            crit,
            element,
            basic_skill_id: basicSkill.id,
            special_skill_id: specialSkill ? specialSkill.id : null,
            ultimate_skill_id: ultimateSkill ? ultimateSkill.id : null,
        });

        return new Character({
            id: character_id[0],
            user_id: user.id,
            name,
            rarity,
            hp,
            pwr,
            def,
            speed,
            dodge,
            crit,
            element,
            basicSkill,
            specialSkill,
            ultimateSkill
        });
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

        const titleList = titlesByRarity[rarity] || ["le Sans-Nom"];
        const title = titleList[Math.floor(Math.random() * titleList.length)];

        return `${name} ${title}`;
    }

    static generateRandomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async save() {
        return Character.knex('characters').update({
            user_id: this.user_id,
            name: this.name,
            rarity: this.rarity,
            hp: this.hp,
            pwr: this.pwr,
            def: this.def,
            speed: this.speed,
            dodge: this.dodge,
            crit: this.crit,
            element: this.element
        }).where('id', this.id);
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
