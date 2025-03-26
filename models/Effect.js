const namesConfig = require('../config/effectNames.json');


function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

class Effect {
    static knex = null;

    constructor(parameters) {
        // Variables propres à l'objet
        this.skill = parameters.skill ?? null;

        // Variables de la base de données
        this.id = parameters.id ?? null;
        this.element = parameters.element ?? this.generateElement();
        this.affected_stat = parameters.affected_stat ?? this.generateAffectedStat();
        this.target = parameters.target ?? this.generateTarget();
        this.duration = parameters.duration ?? this.generateDuration();
        this.value = parameters.value ?? this.generateValue();
        this.name = parameters.name ?? this.generateName();
        this.description = parameters.description ?? this.getDescription();

    }

    static async create(skill) {
        const effect = new Effect({ skill });

        const effect_id = await Effect.knex('effects').insert({
            name: effect.name,
            description: effect.description,
            element: effect.element,
            affected_stat: effect.affected_stat,
            target: effect.target,  
            duration: effect.duration,
            value: effect.value,
            skill_id: effect.skill.id,
            created_at: new Date(),
            updated_at: new Date()
        });

        effect.id = effect_id[0];

        return effect;
    }
    
    generateElement() {
        if (this.skill.character.rarity === 'common' || this.skill.character.rarity === 'rare')
            return this.skill.character.element;
        else
            return getRandomElement([this.skill.character.element, 'neutral']);
    }

    generateTarget() {
        const BasicSkill = require('./BasicSkill');
        if (this.skill instanceof BasicSkill) return 'enemy';
        else return getRandomElement(['self', 'enemy'])
    }

    generateAffectedStat() {
        const BasicSkill = require('./BasicSkill');
        if (this.skill instanceof BasicSkill) return 'hp';
        else return getRandomElement(['hp', 'pwr', 'def', 'speed', 'dodge', 'crit']);
    }

    generateDuration() {
        const BasicSkill = require('./BasicSkill');
        const SpecialSkill = require('./SpecialSkill');
        const UltimateSkill = require('./UltimateSkill');
        if (this.skill instanceof BasicSkill) return 1;
        if (this.skill instanceof SpecialSkill) return getRandomElement([2, 3]);
        if (this.skill instanceof UltimateSkill) return getRandomElement([3, 4]);
    }

    generateValue() {
        const BasicSkill = require('./BasicSkill');
        const SpecialSkill = require('./SpecialSkill');
        const UltimateSkill = require('./UltimateSkill');
        const randomFactor = (Math.random() * 0.2) + 0.9; // 90% - 110%
        const rarityMultipliers = { common: 0.9, rare: 1.0, epic: 1.0, legendary: 1.2 };
        const multiplier = rarityMultipliers[this.skill.character.rarity];
        if (this.skill instanceof BasicSkill) {
            const pwrFactor = this.skill.character.pwr * multiplier * randomFactor;
            return this.value ?? Math.round(pwrFactor);
        } else if (this.skill instanceof SpecialSkill) {
            const pwrFactor = this.skill.character.pwr * multiplier * ((Math.random() * 0.3) + 1.2); // 120% - 150%
            return this.value ?? Math.round(pwrFactor);
        } else if (this.skill instanceof UltimateSkill) {
            const pwrFactor = this.skill.character.pwr * multiplier * ((Math.random() * 0.4) + 1.8); // 180% - 220%
            return this.value ?? Math.round(pwrFactor);
        }
    }

    generateName() {
        let prefix_index = null;
        if (this.duration > 1) prefix_index = 'durable';
        else prefix_index = 'instant';

        const prefix_array = namesConfig.prefixes[this.target][this.affected_stat][prefix_index];
        const cores_array = namesConfig.cores[this.element];
        const suffix_array = namesConfig.suffixes[this.skill.level - 1];

        const prefix = getRandomElement(prefix_array);
        const cores = getRandomElement(cores_array);
        const suffix = getRandomElement(suffix_array);

        return `${prefix} ${cores} ${suffix}`.trim();
    }

    getDescription() {
        if (this.affected_stat === 'hp') {
            return this.target === 'enemy'
                ? `Inflige **${this.value}** dégâts de type **${this.element}** à l'ennemi.`
                : `Soigne **${this.value}** points de vie du lanceur.`;
        }
        return this.target === 'self'
            ? `Augmente **${this.affected_stat}** de **${this.value}%** pendant **${this.duration}** tours.`
            : `Diminue **${this.affected_stat}** de **${this.value}%** sur l'ennemi pendant **${this.duration}** tours.`;
    }

  

    async save() {
        return Effect.knex('effects').update({
            name: this.name,
            description: this.description,
            element: this.element,
            affected_stat: this.affected_stat,
            target: this.target,
            duration: this.duration,
            value: this.value,
            skill_id: this.skill.id,
            updated_at: new Date()
        }).where('id', this.id)
    }

    upgrade() {
        this.value = this.generateValue(); // wip: work in progress
        this.description = this.getDescription();
    }

    levelup() {
        this.name = this.name.split(' ').slice(0, -1).join(' ') + ' ' + getRandomElement(namesConfig.suffixes[this.skill.level - 1]);
    }

}

module.exports = Effect;