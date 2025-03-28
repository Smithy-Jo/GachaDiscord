const Skill = require('./Skill');
const Effect = require('./Effect');

class UltimateSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? Math.floor(Math.random() * 6) + 5; // 5 - 10 || wip : A mettre dans un fichier de config
        this.cooldown = parameters.cooldown ?? Math.floor(Math.random() * 4) + 4; // 4 - 7
    }

    static async create(parameters) {

        const skill = new UltimateSkill({ character: parameters.character });

        const skill_id = await Skill.knex('skills').insert({
            level: skill.level,
            energy_cost: skill.energy_cost, // wip: faire uniquement avec skill
            cooldown: skill.cooldown,
        });
        skill.id = skill_id[0];

        // Wip : Voir si pas possible de le mettre dans la class Skill directement
        let numberOfEffects = 2;
        if (skill.character.rarity === 'epic')
            numberOfEffects = Math.floor(Math.random() * 2) + 2; // 2 - 3
        else if (skill.character.rarity === 'legendary')
            numberOfEffects = 3

        for (let i = 0; i < numberOfEffects; i++) {
            const effect = await Effect.create({ skill });
            skill.effects.push(effect);
        }

        return skill;
    }
    static async loadInCharacterById(parameters) {
        const skillData = await Skill.knex('skills').where('id', parameters.skillId).first();
        if (!skillData) return null;

        const skill = new UltimateSkill(skillData);
        skill.character = parameters.character;
        skill.character.ultimateSkill = skill;
        await Effect.loadInSkill(skill);
    }

}

module.exports = UltimateSkill;