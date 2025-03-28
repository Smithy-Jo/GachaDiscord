const Skill = require("./Skill");
const Effect = require("./Effect");

class SpecialSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? Math.floor(Math.random() * 4) + 1; // 1 - 4;
        this.cooldown = parameters.cooldown ?? Math.floor(Math.random() * 4) + 2; // 2 - 3;
    }

    static async create(parameters) {

        const skill = new SpecialSkill({ character: parameters.character });

        const skill_id = await Skill.knex('skills').insert({
            level: skill.level,
            energy_cost: skill.energy_cost,
            cooldown: skill.cooldown,
        });
        skill.id = skill_id[0];

        let numberOfEffects = 1;
        if (skill.character.rarity === 'epic')
            numberOfEffects = Math.floor(Math.random() * 2) + 1; // 1 - 2
        else if (skill.character.rarity === 'legendary')
            numberOfEffects = 2

        for (let i = 0; i < numberOfEffects; i++) {
            const effect = await Effect.create({ skill });
            skill.effects.push(effect);
        }

        return skill;
    }

    static async loadInCharacterById(parameters) {
        const skillData = await Skill.knex('skills').where('id', parameters.skillId).first();
        if (!skillData) return null;

        const skill = new SpecialSkill(skillData);
        skill.character = parameters.character;
        skill.character.specialSkill = skill;
        await Effect.loadInSkill(skill);
    }
}

module.exports = SpecialSkill;