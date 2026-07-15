import coloniesData from '../mock-data/colonies';

let colonies = [...coloniesData];
let nextId = colonies.length > 0 ? Math.max(...colonies.map((c) => c.id)) + 1 : 1;

export const getColonies = async () => colonies;

export const getColonyById = async (id) =>
  colonies.find((c) => c.id === Number(id)) || null;

export const addColony = async (colony) => {
  const newColony = { ...colony, id: nextId++ };
  colonies.push(newColony);
  return newColony;
};

export const updateColony = async (id, colony) => {
  const idx = colonies.findIndex((c) => c.id === Number(id));
  if (idx === -1) throw new Error('Colony not found');
  colonies[idx] = { ...colonies[idx], ...colony };
  return colonies[idx];
};

export const deleteColony = async (id) => {
  colonies = colonies.filter((c) => c.id !== Number(id));
  return { id, deleted: true };
};

const colonyService = { getColonies, getColonyById, addColony, updateColony, deleteColony };

export default colonyService;
