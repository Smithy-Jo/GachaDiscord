

const User = require('./User');
const Character = require('./Character');
const Effect = require('./Effect');
const Skill = require('./Skill');
const Quest = require('./Quest');

// Initialisation de la base de données
module.exports = {
    initializeDatabase: async () => {

        const knexfile = require('../knexfile');
        const knex = require('knex')(knexfile.development);

        User.knex = knex;
        Character.knex = knex;
        Effect.knex = knex;
        Skill.knex = knex;
        Quest.knex = knex;

        console.log('[INFO] Database initialized successfully');

    },
    User,
    Character,
    Effect,
    Skill,
    Quest

}
