/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw(`
    CREATE TABLE rooms (
      id CHAR(5) COLLATE utf8mb4_bin,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    );
    CREATE TABLE users (
      id CHAR() DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      room_id CHAR(5) COLLATE utf8mb4_bin,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(`
    DROP TABLE rooms;
    DROP TABLE users;
  `)
}
