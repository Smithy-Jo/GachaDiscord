const Skill = require("./Skill");
const Effect = require("./Effect");

class BasicSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? 0;
        this.cooldown = parameters.cooldown ?? 0;
    }

    static async create(parameters) {

        const skill = new BasicSkill({ character: parameters.character });

        const skill_id = await Skill.knex('skills').insert({
            energy_cost: skill.energy_cost,
            cooldown: skill.cooldown,
            level: skill.level 
        });
        skill.id = skill_id[0];

        const effect = await Effect.create({ skill });

        skill.effects = [effect];

        return skill;
    }
    
    static async loadInCharacterById(parameters) {
        const skillData = await Skill.knex('skills').where('id', parameters.skillId).first();
        if (!skillData) return null;
        const skill = new BasicSkill(skillData);
        skill.character = parameters.character;
        skill.character.basicSkill = skill;
        await Effect.loadInSkill(skill);
    }
}

module.exports = BasicSkill;