/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("todos", function(table) {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.enum("status", ["pending", "completed", "archived"]).defaultTo("pending");

    table.boolean("is_deleted").defaultTo(false);
    table.boolean("is_archived").defaultTo(false);
    table.dateTime("expires_at");
    table.dateTime("completed_at");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("todos");
};
