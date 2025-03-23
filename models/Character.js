const { EmbedBuilder } = require('discord.js');
const { prefixes, cores, suffixes, titlesByRarity } = require('../config/characterNames.json');
const configDrop = require('../config/drop.json');
const Effect = require('./Effect');


function generateCharacterName(rarity) {
    
    // Génération du nom
    const name = prefixes[Math.floor(Math.random() * prefixes.length)] +
                 cores[Math.floor(Math.random() * cores.length)] +
                 suffixes[Math.floor(Math.random() * suffixes.length)];

    // Sélection d'un titre en fonction de la rareté
    const titleList = titlesByRarity[rarity] || ["le Sans-Nom"]; 
    const title = titleList[Math.floor(Math.random() * titleList.length)];

    return `${name} ${title}`;
}

// Fonction pour formater la rareté avec des emojis
function formatRarity(rarity) {
    const emojis = {
        common: "⚪ **Commun**",
        rare: "🔵 **Rare**",
        epic: "🟣 **Épique**",
        legendary: "🟠 **Légendaire**"
    };
    return emojis[rarity] || rarity;
}

// Fonction pour définir la couleur de l'embed en fonction de la rareté
function getRarityColor(rarity) {
    const colors = {
        common: 0xA0A0A0, // Gris
        rare: 0x0099FF, // Bleu
        epic: 0x800080, // Violet
        legendary: 0xFFA500 // Orange
    };
    return colors[rarity] || 0xFFFFFF; // Blanc par défaut
}

class Character {

    static knex = null;
    
    constructor(user) {
        this.user_id = user.id;
        this.rarity = Character.getRarity(user);
        this.name = generateCharacterName(this.rarity);
        this.generateStats(); // hp, atk, def, speed, dodge, crit, element
        this.generateSkills();
    }

    static getRarity(user) {
        const pity_system = configDrop.pity_system;
        if (user.legendary_pity >= pity_system.legendary_guarantee) {
            return 'legendary';
        }
        if (user.epic_pity >= pity_system.epic_guarantee) {
            return 'epic';
        }

        const roll = Math.random() * 100;
        let cumulativeChance = 0;
        for (const [rarity, data] of Object.entries(configDrop.rarity_rates)) {
            cumulativeChance += data.probability;
            if (roll <= cumulativeChance) {
                return rarity;
            }
        }
        return 'common';
    }

    static getRandomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateStats() {
        const rarity_rates = configDrop.rarity_rates;
        const stats = rarity_rates[this.rarity].stats_range;

        this.hp = Character.getRandomStat(stats.hp.min, stats.hp.max);
        this.atk = Character.getRandomStat(stats.atk.min, stats.atk.max);
        this.def = Character.getRandomStat(stats.def.min, stats.def.max);
        this.speed = Character.getRandomStat(stats.speed.min, stats.speed.max);
        this.dodge = Character.getRandomStat(stats.dodge.min, stats.dodge.max) / 100;
        this.crit = Character.getRandomStat(stats.crit.min, stats.crit.max) / 10;

        this.element = ['fire', 'water', 'earth'][Math.floor(Math.random() * 3)];
    }

    generateSkills() {
        // Genere l'attaque de base
        // Genere la capacité spéciale si rareté >= épique
        // Genere la capacité ultime si rareté == légendaire
    }

    async save() {
        return Character.knex('characters').insert({
            user_id: this.user_id,
            name: this.name,
            rarity: this.rarity,
            hp: this.hp,
            atk: this.atk,
            def: this.def,
            speed: this.speed,
            dodge: this.dodge,
            crit: this.crit,
            element: this.element
        });
    }

    generateEmbed() {
        const embed = new EmbedBuilder()
            .setTitle(`🎭 Nouveau personnage obtenu !`)
            .setDescription(`**Nom : ${this.name}\nRareté : ${formatRarity(this.rarity)}**`)
            .setColor(getRarityColor(this.rarity))
            .addFields(
                { name: "❤️ PV", value: `${this.hp}`, inline: true },
                { name: "⚔️ ATK", value: `${this.atk}`, inline: true },
                { name: "🛡️ DEF", value: `${this.def}`, inline: true },
                { name: "💨 Vitesse", value: `${this.speed}`, inline: true },
                { name: "🎯 Esquive", value: `${(this.dodge * 100).toFixed(1)}%`, inline: true },
                { name: "💥 Critique", value: `${(this.crit * 10).toFixed(1)}%`, inline: true }
            )
            .setTimestamp();
    
        return embed;
    }
}

module.exports = Character;