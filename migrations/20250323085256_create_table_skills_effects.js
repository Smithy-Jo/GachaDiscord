/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('skills_effects', (table) => {
        table.increments('id').primary();
        table.integer('skill_id').unsigned().notNullable().references('id').inTable('skills').onDelete('CASCADE');
        table.integer('effect_id').unsigned().notNullable().references('id').inTable('effects').onDelete('CASCADE');
        table.integer('chance').notNullable().defaultTo(100);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('skills_effects');
};
