/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { faker } = require('@faker-js/faker');

const generateTodo = () => {
  const createdAt = faker.date.past({ years: 1 }); 
  const expiresAt = faker.date.between({
    from: new Date(), 
    to: faker.date.future({ years: 1 }), 
  });
  const status = faker.helpers.arrayElement(['pending', 'completed', 'archived']);
  
  let completedAt = null;
  let isArchived = false;
  let isDeleted = false;
  let updatedAt = createdAt;

  if (status === 'completed') {
    completedAt = faker.date.between({ from: createdAt, to: new Date() });
    updatedAt = completedAt; 
  } else if (status === 'archived') {
    isArchived = true;
    updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  } else if (faker.datatype.boolean(0.1)) { 
    isDeleted = true;
    updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  } else {
    updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  }

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 7 }), 
    description: faker.lorem.paragraph({ min: 1, max: 3 }), 
    expires_at: expiresAt,
    created_at: createdAt,
    updated_at: updatedAt,
    is_deleted: isDeleted,
    is_archived: isArchived,
    status: status,
    completed_at: completedAt,
  };
};

const todos = Array.from({ length: 40 }, generateTodo);


exports.seed = async function (knex) {
  await knex('todos').del();
  await knex('todos').insert(todos);
};