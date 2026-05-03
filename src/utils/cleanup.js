import cron from 'node-cron';
import prisma from '../config/prisma.js';

export const startLogRetention = () => {
  // Schedules the task to run every Sunday at Midnight (0 0 * * 0)
  cron.schedule('0 0 * * 0', async () => {
    console.log("Running scheduled log cleanup...");
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await prisma.systemLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log(`Log Cleanup: Deleted ${deleted.count} old log entries.`);
    } catch (error) {
      console.error("Error during log cleanup:", error);
    }
  });
};