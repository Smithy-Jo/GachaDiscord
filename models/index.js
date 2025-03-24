const knexfile = require('../knexfile');
const knex = require('knex')(knexfile.development); 

const User = require('./User');
const Character = require('./Character');
const Effect = require('./Effect');
const Skill = require('./Skill');
const BasicSkill = require('./BasicSkill');
const SpecialSkill = require('./SpecialSkill');
const UltimateSkill = require('./UltimateSkill');

User.knex = knex;
Character.knex = knex;
Effect.knex = knex;
Skill.knex = knex;
BasicSkill.knex = knex;
// SpecialSkill.knex = knex;
// UltimateSkill.knex = knex;

User.knex = knex;
Character.knex = knex;
