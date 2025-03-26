const Skill = require('./Skill');
const Effect = require('./Effect');

class UltimateSkill extends Skill {
  constructor(parameters) {
    super(parameters);
    this.energy_cost = parameters.energy_cost ?? Math.floor(Math.random() * 6) + 5; // 5 - 10 || wip : A mettre dans un fichier de config
    this.cooldown = parameters.cooldown ?? Math.floor(Math.random() * 4) + 4; // 4 - 7
  }
  
  static async create(character) {

    const ultimateSkill = new UltimateSkill({ character });

    ultimateSkill.id = await this.knex('skills').insert({
        level: ultimateSkill.level,
        energy_cost: ultimateSkill.energy_cost, // wip: faire uniquement avec ultimateSkill
        cooldown: ultimateSkill.cooldown,
    });

    // Wip : Voir si pas possible de le mettre dans la class Skill directement
    let numberOfEffects = 2;
    if (ultimateSkill.character.rarity === 'epic')
        numberOfEffects = Math.floor(Math.random() * 2) + 2; // 2 - 3
    else if (ultimateSkill.character.rarity === 'legendary')
        numberOfEffects = 3

    for (let i = 0; i < numberOfEffects; i++) {
        const effect = await Effect.create(ultimateSkill);
        ultimateSkill.effects.push(effect);
    }

    return ultimateSkill;
}

}

module.exports = UltimateSkill;