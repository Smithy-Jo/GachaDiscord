/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('skills', (table) => {
            table.increments('id').primary();
            table.integer('level').notNullable().defaultTo(1);
            table.integer('energy_cost').notNullable().defaultTo(0);
            table.integer('cooldown').defaultTo(0);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('skills');
};
