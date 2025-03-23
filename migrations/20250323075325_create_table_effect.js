/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('effects', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description').notNullable(); 
        table.enum('element', ['neutral', 'fire', 'water', 'earth']).notNullable();
        table.enum('affected_stat', ['hp', 'atk', 'def', 'speed', 'dodge', 'crit']); 
        table.enum('target', ['self', 'enemy']).notNullable();
        table.integer('duration').notNullable();
        table.integer('value').notNullable(); 
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('effects');
};
