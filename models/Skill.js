
class Skill {
    static knex = null;

    constructor(parameters) {
        this.id = parameters.id;
        this.level = parameters.level;
        this.skill_type = parameters.skill_type;
        this.element = parameters.element;
        this.energy_cost = parameters.energy_cost;
        this.cooldown = parameters.cooldown;
        this.effects = parameters.effects;
    }

    async save() {
        const savesEffects = this.effects.map(effect => effect.save());
        await Promise.all(savesEffects);

        return Skill.knex('skills').update({
            level: this.level,
            skill_type: this.skill_type,
            element: this.element,
            energy_cost: this.energy_cost,
            cooldown: this.cooldown,
            updated_at: new Date()
        }).where('id', this.id);
    }

}

module.exports = Skill;