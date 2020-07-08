import * as faker from "faker"; // eslint-disable-line import/no-extraneous-dependencies

export const generateArray = (itemGenerator: any, max: number = 1000) => {
  const itemCount = faker.random.number(max || 1000);
  const items = [];
  for (let i = 0; i <= itemCount; i += 1) {
    let item = itemGenerator;

    if (typeof itemGenerator === "function") {
      item = itemGenerator();
    }

    items.push(item);
  }

  return items;
};
