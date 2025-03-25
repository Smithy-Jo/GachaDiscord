const Skill = require("./Skill");
const Effect = require("./Effect");

class SpecialSkill extends Skill {
    constructor(parameters) {
        super(parameters);
    }
    static async create(character_element, character_pwr, character_rarity) {

        const energy_cost = Math.floor(Math.random() * 4) + 1; // 1 - 4
        const cooldown = Math.floor(Math.random() * 4) + 2; // 2 - 3

        const skill_id = await this.knex('skills').insert({
            energy_cost,
            cooldown,
        });

        const special_skill = new SpecialSkill({
            id: skill_id[0],
            level: 1,
            energy_cost,
            cooldown,
        });

        let numberOfEffects = 1;
        if (character_rarity === 'epic')
            numberOfEffects = Math.floor(Math.random() * 2) + 1; // 1 - 2

        else if (character_rarity === 'legendary')
            numberOfEffects = 2

        for (let i = 0; i < numberOfEffects; i++) {
            const effect = await Effect.create({
                character_element,
                character_pwr,
                character_rarity,
                skill_id: skill_id[0],
                skill_type: 'special_skill'
            });
            special_skill.effects.push(effect);
        }

        return special_skill;
    }
}

module.exports = SpecialSkill;