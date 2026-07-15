import activitiesData from '../mock-data/activities';

let activities = [...activitiesData];
let nextId = activities.length > 0 ? Math.max(...activities.map((a) => a.id)) + 1 : 1;

export const getActivities = async () => activities;

export const getActivityById = async (id) =>
  activities.find((a) => a.id === Number(id)) || null;

export const addActivity = async (activity) => {
  const newActivity = { ...activity, id: nextId++ };
  activities.push(newActivity);
  return newActivity;
};

export const updateActivity = async (id, activity) => {
  const idx = activities.findIndex((a) => a.id === Number(id));
  if (idx === -1) throw new Error('Activity not found');
  activities[idx] = { ...activities[idx], ...activity };
  return activities[idx];
};

export const deleteActivity = async (id) => {
  activities = activities.filter((a) => a.id !== Number(id));
  return { id, deleted: true };
};

const activityService = { getActivities, getActivityById, addActivity, updateActivity, deleteActivity };

export default activityService;
