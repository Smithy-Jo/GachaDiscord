const Skill = require("./Skill");
const Effect = require("./Effect");

class BasicSkill extends Skill {
    constructor(parameters) {
        super({...parameters, skill_type: 'basic_skill'});
    }

    static async create(character_element, character_atk) {

        const effect = await Effect.create({
            element: character_element,
            affected_stat: 'hp',
            target: 'enemy',
            duration: 1,
            value: character_atk,
            skill_type: 'basic_skill'
        });

        const skill_id = await this.knex('skills').insert({
            level: 1,
            skill_type: 'basic_skill',
            element: character_element,
            energy_cost: 1,
            cooldown: 0,
        });

        await this.knex('skills_effects').insert({
            skill_id: skill_id[0],
            effect_id: effect.id,
        });

        return new BasicSkill({
            id: skill_id[0],
            level: 1,
            element: character_element,
            energy_cost: 1,
            cooldown: 0,
            effects: [effect],
        });
    }
}

module.exports = BasicSkill;