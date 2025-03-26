const Skill = require("./Skill");
const Effect = require("./Effect");

class SpecialSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? Math.floor(Math.random() * 4) + 1; // 1 - 4;
        this.cooldown = parameters.cooldown ?? Math.floor(Math.random() * 4) + 2; // 2 - 3;
    }

    static async create(character) {

        const specialSkill = new SpecialSkill({ character });

        specialSkill.id = await this.knex('skills').insert({
            level: specialSkill.level,
            energy_cost: specialSkill.energy_cost,
            cooldown: specialSkill.cooldown,
        });

        let numberOfEffects = 1;
        if (specialSkill.character.rarity === 'epic')
            numberOfEffects = Math.floor(Math.random() * 2) + 1; // 1 - 2
        else if (specialSkill.character.rarity === 'legendary')
            numberOfEffects = 2

        for (let i = 0; i < numberOfEffects; i++) {
            const effect = await Effect.create(specialSkill);
            specialSkill.effects.push(effect);
        }

        return specialSkill;
    }
}

module.exports = SpecialSkill;