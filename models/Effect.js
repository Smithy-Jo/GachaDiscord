const { range } = require('discord.js');
const namesConfig = require('../config/effectNames.json');

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const rarityMultipliers = { common: 0.9, rare: 1.0, epic: 1.0, legendary: 1.2 };

class Effect {
    static knex = null;

    constructor() {
        this.id = null;
        this.skill_id = null;
        this.name = null;
        this.description = null;
        this.element = null;
        this.affected_stat = null;
        this.target = null;
        this.duration = null;
        this.value = null;
        this.skill_type = null;
    }

    generateName() {
        let prefix_index = null;
        if (this.duration > 1) prefix_index = 'durable';
        else prefix_index = 'instant';
        
        const prefix = getRandomElement(namesConfig.prefixes[this.target][this.affected_stat][prefix_index]);
        const cores = getRandomElement(namesConfig.cores[this.element]);
        const suffix = getRandomElement(namesConfig.suffixes[this.skill_type]);
        return `${prefix} ${cores} ${suffix}`.trim();
    }

    generateDescription() {
        if (this.affected_stat === 'hp') {
            return this.target === 'enemy'
                ? `Inflige **${this.value}** dégâts de type **${this.element}** à l'ennemi.`
                : `Soigne **${this.value}** points de vie du lanceur.`;
        }
        return this.target === 'self'
            ? `Augmente **${this.affected_stat}** de **${this.value}%** pendant **${this.duration}** tours.`
            : `Diminue **${this.affected_stat}** de **${this.value}%** sur l'ennemi pendant **${this.duration}** tours.`;
    }

    static async create(parameters) { // { character_element, character_pwr, character_rarity, affected_stat, target, duration, value, skill_type, skill_ernergy_cost }
        const effect = new Effect();

        effect.skill_id = parameters.skill_id;
        
        effect.element = parameters.character_element ?? getRandomElement([parameters.character_element, 'neutral']);
        effect.affected_stat = parameters.affected_stat ?? getRandomElement(['hp', 'pwr', 'def', 'speed', 'dodge', 'crit']);
        effect.target = parameters.target ?? getRandomElement(['self', 'enemy']);
        
        const multiplier = rarityMultipliers[parameters.character_rarity] ?? 1;
        const randomFactor = (Math.random() * 0.2) + 0.9; // 90% - 110%
        effect.skill_type = parameters.skill_type;
        if (effect.skill_type === 'basic_skill') {
            effect.duration = 1;
            const pwrFactor = parameters.character_pwr * multiplier * randomFactor;
            effect.value = parameters.value ?? Math.round(pwrFactor);
        }
        else if (effect.skill_type === 'special_skill') {
            effect.duration = getRandomElement([2, 3]); // Durée aléatoire entre 2 et 3
            const pwrFactor = parameters.character_pwr * multiplier * ((Math.random() * 0.3) + 1.2); // 120% - 150%
            effect.value = parameters.value ?? Math.round(pwrFactor);
        }
        else if (effect.skill_type === 'ultimate_skill') {
            effect.duration = getRandomElement([3, 4]); // Durée aléatoire entre 3 et 4
            const pwrFactor = parameters.character_pwr * multiplier * ((Math.random() * 0.4) + 1.8); // 180% - 220%
            effect.value = parameters.value ?? Math.round(pwrFactor);
        }

        effect.name = effect.generateName();
        effect.description = effect.generateDescription();

        const effect_id = await Effect.knex('effects').insert({
            skill_id: effect.skill_id,
            name: effect.name,
            description: effect.description,
            element: effect.element,
            affected_stat: effect.affected_stat,
            target: effect.target,
            duration: effect.duration,
            value: effect.value,
            created_at: new Date(),
            updated_at: new Date()
        });

        effect.id = effect_id[0];

        return effect;
    }

    async save() {
        return Effect.knex('effects').update({
            skill_id: this.skill_id,
            name: this.name,
            description: this.description,
            element: this.element,
            affected_stat: this.affected_stat,
            target: this.target,
            duration: this.duration,
            value: this.value,
            updated_at: new Date()
        }).where('id', this.id)
    }
}

module.exports = Effect;