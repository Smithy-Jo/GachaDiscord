const Character = require('./Character');

class Quest {
    static knex = null;

    constructor(parameters) {
        this.id = parameters.id ?? null;
        this.description = parameters.description ?? null;
        this.level = parameters.level ?? null;
        this.exp = parameters.exp ?? null;
        this.gold = parameters.gold ?? null;
        this.enemies = parameters.enemies ?? null;
    }

    static async create(parameters) {

        const quest = new Quest(parameters);

        const quest_id = await Quest.knex('quests').insert({
            description: quest.description,
            level: quest.level,
            exp: quest.exp,
            gold: quest.gold,
        });
        
        quest.id = quest_id[0];
        
        return quest;
    }

}

module.exports = Quest;
