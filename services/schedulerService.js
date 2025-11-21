import cron from "node-cron";
import Blog from "../models/Blog.js";
import Counter from "../models/Counter.js";

export const generateBlogId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "blogId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

export const publishScheduledBlogs = async () => {
  try {
    const now = new Date();
    const scheduledBlogs = await Blog.find({
      status: "scheduled",
      scheduledDate: { $lte: now }
    });

    for (const blog of scheduledBlogs) {
      blog.status = "published";
      blog.publishedAt = now;
      await blog.save();
    }
  } catch (err) {
    console.error("Scheduler Error:", err);
  }
};

export const startScheduler = () => {
  cron.schedule("*/1 * * * *", publishScheduledBlogs);
  console.log("Blog scheduler started - checking every minute");
};
