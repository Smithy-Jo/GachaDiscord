const namesConfig = require('../config/effectNames.json');

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}



class Effect {
    static knex = null;

    constructor() {
        this.id = null;
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
        // console.log(`target : ${this.target}`);
        // console.log(`affected_stat : ${this.affected_stat}`);
        // console.log(`prefix_index : ${prefix_index}`);
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

    static async create(parameters) {
        const effect = new Effect();
        
        effect.element = parameters.element;
        effect.affected_stat = parameters.affected_stat;
        effect.target = parameters.target;
        effect.duration = parameters.duration;
        effect.value = parameters.value;
        effect.skill_type = parameters.skill_type;

        effect.name = effect.generateName();
        effect.description = effect.generateDescription();

        const effect_id = await Effect.knex('effects').insert({
            name: effect.name,
            description: effect.description,
            element: effect.element,
            affected_stat: effect.affected_stat,
            target: effect.target,
            duration: effect.duration,
            value: effect.value,
            created_at: new Date(),
            updated_at: new Date()
        }); // Renvoie l'ID généré par la base de données;

        effect.id = effect_id[0];

        return effect;
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
            updated_at: new Date()
        }).where('id', this.id) // Renvoie l'ID généré par la base de données;
    }
}

module.exports = Effect;