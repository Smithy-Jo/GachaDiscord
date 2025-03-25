const knexfile = require('../knexfile');
const knex = require('knex')(knexfile.development); 

const User = require('./User');
const Character = require('./Character');
const Effect = require('./Effect');
const Skill = require('./Skill');

User.knex = knex;
Character.knex = knex;
Effect.knex = knex;
Skill.knex = knex;

User.knex = knex;
Character.knex = knex;
