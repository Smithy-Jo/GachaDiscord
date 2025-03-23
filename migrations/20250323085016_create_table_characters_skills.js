/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('characters_skills', (table) => {
        table.increments('id').primary();
        table.integer('character_id').unsigned().notNullable().references('id').inTable('characters').onDelete('CASCADE');
        table.integer('skill_id').unsigned().notNullable().references('id').inTable('skills').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('characters_skills');
};
