const Skill = require('./Skill');
const Effect = require('./Effect');

class UltimateSkill extends Skill {
  constructor(parameters) {
    super(parameters);
  }
  
  static async create(character_element, character_pwr, character_rarity) {

    const energy_cost = Math.floor(Math.random() * 6) + 5; // 5 - 10
    const cooldown = Math.floor(Math.random() * 4) + 4; // 4 - 7

    const skill_id = await this.knex('skills').insert({
        energy_cost,
        cooldown,
    });

    const ultimate_skill = new UltimateSkill({
        id: skill_id[0],
        level: 1,
        energy_cost,
        cooldown,
    });

    let numberOfEffects = 2;
    if (character_rarity === 'epic')
        numberOfEffects = Math.floor(Math.random() * 2) + 2; // 2 - 3

    else if (character_rarity === 'legendary')
        numberOfEffects = 3

    for (let i = 0; i < numberOfEffects; i++) {
        const effect = await Effect.create({
            character_element,
            character_pwr,
            character_rarity,
            skill_id: skill_id[0],
            skill_type: 'ultimate_skill'
        });
        ultimate_skill.effects.push(effect);
    }

    return ultimate_skill;
}

}

module.exports = UltimateSkill;