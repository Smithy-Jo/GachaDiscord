const Skill = require("./Skill");
const Effect = require("./Effect");

class BasicSkill extends Skill {
    constructor(parameters) {
        super(parameters);
        this.energy_cost = parameters.energy_cost ?? 0;
        this.cooldown = parameters.cooldown ?? 0;
    }

    static async create(character) {

        const basicSkill = new BasicSkill({ character });

        basicSkill.id = await this.knex('skills').insert({
            energy_cost: basicSkill.energy_cost,
            cooldown: basicSkill.cooldown,
            level: basicSkill.level 
        });

        const effect = await Effect.create(basicSkill);

        basicSkill.effects = [effect];

        return basicSkill;
    }
}

module.exports = BasicSkill;