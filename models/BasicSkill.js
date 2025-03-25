const Skill = require("./Skill");
const Effect = require("./Effect");

class BasicSkill extends Skill {
    constructor(parameters) {
        super(parameters);
    }

    static async create(character_element, character_atk, character_rarity) {

        const skill_id = await this.knex('skills').insert({
            energy_cost: 1,
            cooldown: 0,
        });

        const effect = await Effect.create({
            character_element,
            character_rarity,
            character_atk,
            skill_id: skill_id[0],
            skill_type: 'basic_skill',
            affected_stat: 'hp',
            target: 'enemy',
            duration: 1,
        });

        return new BasicSkill({
            id: skill_id[0],
            energy_cost: 1,
            cooldown: 0,
            effects: [effect],
        });
    }
}

module.exports = BasicSkill;