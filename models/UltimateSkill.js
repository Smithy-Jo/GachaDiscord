const Skill = require('./Skill');
const Effect = require('./Effect');

class UltimateSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? Math.floor(Math.random() * 6) + 5; // 5 - 10 || wip : A mettre dans un fichier de config
        this.cooldown = parameters.cooldown ?? Math.floor(Math.random() * 4) + 4; // 4 - 7
    }

    static create(parameters) {
        const ultimateSkill = new UltimateSkill(parameters);

        let numberOfEffects = 2;
        if (ultimateSkill.character.rarity === 'epic')
            numberOfEffects = Math.floor(Math.random() * 2) + 2; // 2 - 3
        else if (ultimateSkill.character.rarity === 'legendary')
            numberOfEffects = 3

        for (let i = 0; i < numberOfEffects; i++) {
            ultimateSkill.effects.push(new Effect({ skill: ultimateSkill }));
        }

        return ultimateSkill;
    }


    static async loadInCharacterById(parameters) {
        const skillData = await Skill.knex('skills').where('id', parameters.skillId).first();
        if (!skillData) return null;

        const skill = new UltimateSkill({...skillData, character: parameters.character});
        skill.character = parameters.character;
        skill.character.ultimateSkill = skill;
        await Effect.loadInSkill(skill);
    }

}

module.exports = UltimateSkill;