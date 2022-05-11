import cron from "node-cron";
import { cache, fetchAndCache, increaseDayCount } from "./day-counter";
import { sendMessage } from "./messaging";
import { getWeightData, updateWeightAndDay } from "./weight-counter";
export let cronJobs: cron.ScheduledTask[] = [];

const createCronJobs = async () => {
  // empty cronJobs array
  cronJobs = [];
  await fetchAndCache();

  cache.forEach((group) => {
    const isScheduleExpressionValid = cron.validate(
      `${group?.schedule.trim()}`
    );

    // only run if the expression is valid
    if (isScheduleExpressionValid) {
      const job = cron.schedule(
        `${group?.schedule}`,
        async () => {
          try {
            const groupId = Number(group?.chat_id);
            // increases the day count in db
            await increaseDayCount(groupId);

            // send message to the group
            const data = cache.find((g) => g?.chat_id === groupId);

            sendMessage(Number(group?.chat_id), `ថ្ងៃ ${data?.day_count}`);
          } catch (err) {
            console.error(`Cron Job Error\nerror: ${err}`);
          }
        },
        {
          scheduled: false,
          timezone: "Asia/Phnom_Penh",
        }
      );
      cronJobs.push(job);
    }
  });
  const weightData = await getWeightData();
  const isWeightScheduleValid = cron.validate(weightData.schedule);

  if (isWeightScheduleValid) {
    cronJobs.push(
      cron.schedule(
        weightData.schedule,
        async () => {
          const weightData = await updateWeightAndDay();
          sendMessage(
            weightData.group_id,
            `ថ្ងៃទី${weightData.day_count} ព្រឹកនិងល្ងាច ${weightData.weight}kg`
          );
        },
        {
          scheduled: false,
          timezone: "Asia/Phnom_Penh",
        }
      )
    );
  }
  console.log(`[INFO]: ${cronJobs.length} jobs created.`);
};

export const startCronJobs = () => {
  cronJobs.forEach((job) => job.start());
  console.log(`[INFO]: ${cronJobs.length} jobs started.`);
};

export const stopCronJobs = () => {
  cronJobs.forEach((job) => job.stop());
  console.log(`[INFO]: ${cronJobs.length} jobs stopped.`);
  // empty cronJobs array
  cronJobs = [];
};

export const initCronJobs = async () => {
  await createCronJobs();
  startCronJobs();
};

export const restartCronJobs = async () => {
  console.log(`[INFO]: Restarting cron jobs...`);
  stopCronJobs();
  await initCronJobs();
};
