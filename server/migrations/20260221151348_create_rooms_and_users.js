export const up = async function (knex) {
  await knex.raw(`
    CREATE TABLE rooms (
      id CHAR(5) COLLATE utf8mb4_bin PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `)
  await knex.raw(`
    CREATE TABLE users (
      id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      room_id CHAR(5) COLLATE utf8mb4_bin,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );
  `)
}

export const down = async function (knex) {
  await knex.raw(`
    DROP TABLE IF EXISTS users;
  `)
  await knex.raw(`
    DROP TABLE IF EXISTS rooms;
  `)
}
