const Skill = require("./Skill");
const Effect = require("./Effect");

class BasicSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? 0;
        this.cooldown = parameters.cooldown ?? 0;
    }

    static create(parameters) {
        const basicSkill = new BasicSkill(parameters);
        basicSkill.effects = [new Effect({ skill: basicSkill })];
        return basicSkill;
    }
    
    static async loadInCharacterById(parameters) {
        const skillData = await Skill.knex('skills').where('id', parameters.skillId).first();
        if (!skillData) return null;
        
        const skill = new BasicSkill({...skillData, character: parameters.character});
        skill.character.basicSkill = skill;
        await Effect.loadInSkill(skill);
    }
}

module.exports = BasicSkill;