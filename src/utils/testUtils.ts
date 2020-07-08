const faker = require('faker'); // eslint-disable-line import/no-extraneous-dependencies

const generateArray = (itemGenerator, max) => {
  const itemCount = faker.random.number(max || 1000);
  const items = [];
  for (let i = 0; i <= itemCount; i += 1) {
    let item = itemGenerator;

    if (typeof itemGenerator === 'function') {
      item = itemGenerator();
    }

    items.push(item);
  }

  return items;
};

module.exports = { generateArray };
