import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { FRONTEND_URL } from './config.js';

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import activityRoutes from './routes/activity.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import dimensionRoutes from './routes/dimension.routes.js';
import academicUnitRoutes from './routes/academicUnit.routes.js';
import activityProjectRoutes from './routes/activityProject.routes.js';


import editionRoutes from './routes/edition.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import clientRoutes from './routes/client.routes.js';
import personRoutes from './routes/person.routes.js';
import saleRoutes from './routes/sale.routes.js';
import installmentRoutes from './routes/installment.routes.js';
import bingoCardRoutes from './routes/bingoCard.routes.js';
import quotaRoutes from './routes/quota.routes.js';
import sellerPaymentRoutes from './routes/sellerPayment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import drawRoutes from './routes/draw.routes.js';

const app = express();

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", activityRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", dimensionRoutes);
app.use("/api", academicUnitRoutes);
app.use("/api", activityProjectRoutes);

app.use("/api", editionRoutes);
app.use('/api', sellerRoutes);
app.use('/api', clientRoutes);
app.use('/api', personRoutes);
app.use("/api", saleRoutes);
app.use("/api", installmentRoutes);
app.use("/api", bingoCardRoutes);
app.use("/api", quotaRoutes);
app.use("/api", sellerPaymentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", drawRoutes);




export default app;
