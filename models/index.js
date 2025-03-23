const User = require('../models/User');
const Character = require('../models/Character');

const knexfile = require('../knexfile');
const knex = require('knex')(knexfile.development); 

User.knex = knex;
Character.knex = knex;

module.exports = {
    User,
    Character,
}