/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
        table.string('id').primary();
        table.string('username').notNullable();
        table.string('discriminator').notNullable();
        table.string('email').unique();
        table.string('password').notNullable();
        table.integer('balance').notNullable().defaultTo(1000);
        table.integer('total_summons').defaultTo(0);
        table.integer('epic_pity').defaultTo(0);
        table.integer('legendary_pity').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
