
class Skill {
    static knex = null;

    constructor(parameters) {
        this.id = parameters.id;
        this.level = parameters.level ?? 1;
        this.energy_cost = parameters.energy_cost;
        this.cooldown = parameters.cooldown;
        this.effects = parameters.effects ?? [];
    }

    async save() {
        const savesEffects = this.effects.map(effect => effect.save());
        await Promise.all(savesEffects);

        return Skill.knex('skills').update({
            level: this.level,
            cooldown: this.cooldown,
            energy_cost: this.energy_cost,
            updated_at: new Date()
        }).where('id', this.id);
    }

}

module.exports = Skill;