import express from 'express';
import fs from "fs";
import path from "path";
import connectDB from './config/database.js';
import buildAdminRouter from './config/adminjs.js';
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { exportContacts } from './controllers/contactController.js';
import { startScheduler } from './services/schedulerService.js';
import uploadRoute from "./routes/uploadRoute.js";

// Initialize Express app
const app = express();

// Connect to MongoDB
await connectDB();

app.use("/api/upload", uploadRoute);
// Middleware
app.use(express.json());

// Setup AdminJS
const { adminRouter } = buildAdminRouter();
app.use('/admin', adminRouter);

// API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);
app.get('/api/contacts/export', exportContacts);
console.log("DEPLOY FILES:", fs.readdirSync(path.join(process.cwd())));

// Start scheduler for blog auto-publishing
startScheduler();

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`AdminJS is running on http://localhost:${PORT}/admin`);
});
