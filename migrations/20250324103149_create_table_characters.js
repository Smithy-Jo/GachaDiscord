/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('characters', (table) => {
        table.increments("id").primary();

        table.string("user_id").references("id").inTable("users").onDelete("CASCADE");

        table.string("name").notNullable();
        table.enu("rarity", ["common", "rare", "epic", "legendary"]).notNullable();
        table.integer("level").notNullable().defaultTo(1);
        table.integer("xp").notNullable().defaultTo(0);
        table.integer("hp").notNullable();
        table.integer("pwr").notNullable();
        table.integer("def").notNullable();
        table.integer("speed").notNullable();
        table.decimal("dodge", 5, 2).notNullable();
        table.decimal("crit", 5, 2).notNullable();
        table.enu("element", ["fire", "water", "earth"]).notNullable(); 

        table.integer("basic_skill_id").unsigned().references("id").inTable("skills").onDelete("CASCADE");
        table.integer("special_skill_id").unsigned().references("id").inTable("skills").onDelete("CASCADE");
        table.integer("ultimate_skill_id").unsigned().references("id").inTable("skills").onDelete("CASCADE");

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('characters');
};
