const Skill = require("./Skill");
const Effect = require("./Effect");

class SpecialSkill extends Skill {
    constructor(parameters) {
        super(parameters);
    }
    static async create(character_element, character_atk, character_rarity) {

        const energy_cost = Math.floor(Math.random() * 4) + 1; // 1 - 4
        const cooldown = Math.floor(Math.random() * 4) + 2; // 2 - 3

        const skill_id = await this.knex('skills').insert({
            energy_cost,
            cooldown,
        });
        
        const effect = await Effect.create({
            character_element,
            character_atk,
            character_rarity,
            skill_id: skill_id[0],
            skill_type: 'special_skill'
        });

        return new SpecialSkill({
            id: skill_id[0],
            level: 1,
            energy_cost,
            cooldown,
            effects: [effect],
        });
    }
}

module.exports = SpecialSkill;