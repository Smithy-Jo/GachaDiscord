
class Skill {
    static knex = null;

    constructor(parameters) {
        // Variables de la base de données
        this.id = parameters.id ?? null;
        this.level = parameters.level ?? 1;
        this.energy_cost = parameters.energy_cost ?? null;
        this.cooldown = parameters.cooldown ?? null;

        // Variables propres à l'objet
        this.type = parameters.type ?? null;
        this.character = parameters.character ?? null;
        this.effects = parameters.effects ?? [];
    }

    async levelup() {
        this.level++;
        this.effects.forEach(effect => effect.levelup()); 
    }

    async upgrade() {
        this.effects.forEach(effect => effect.upgrade());
    }

    async save() {
        await Promise.all(this.effects.map(effect => effect.save()));
        await Skill.knex('skills').update({
            level: this.level,
            cooldown: this.cooldown,
            energy_cost: this.energy_cost,
            updated_at: new Date()
        }).where('id', this.id);
    } 

}

module.exports = Skill;