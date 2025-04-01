const Skill = require("./Skill");
const Effect = require("./Effect");

class SpecialSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? Math.floor(Math.random() * 4) + 1; // 1 - 4;
        this.cooldown = parameters.cooldown ?? Math.floor(Math.random() * 4) + 2; // 2 - 3;
    }

    static create(parameters) {
        const specialSkill = new SpecialSkill(parameters);

        let numberOfEffects = 1;
        if (specialSkill.character.rarity === 'epic')
            numberOfEffects = Math.floor(Math.random() * 2) + 1; // 1 - 2
        else if (specialSkill.character.rarity === 'legendary')
            numberOfEffects = 2

        for (let i = 0; i < numberOfEffects; i++) {
            specialSkill.effects.push(new Effect({ skill: specialSkill }));
        }

        return specialSkill;
    }

    static async loadInCharacterById(parameters) {
        const skillData = await Skill.knex('skills').where('id', parameters.skillId).first();
        if (!skillData) return null;

        const skill = new SpecialSkill({...skillData, character: parameters.character});
        skill.character = parameters.character;
        skill.character.specialSkill = skill;
        await Effect.loadInSkill(skill);
    }
}

module.exports = SpecialSkill;