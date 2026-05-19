// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import lobbyRoutes from "./routes/lobby.routes.js";
import messageRoutes from "./routes/message.routes.js";
import blobRoutes from "./routes/blob.routes.js";
import dom6Routes from "./routes/dom6.routes.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();

app.use(cookieParser());
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.176:5173",
  "http://25.10.187.183:5173",
  `http://${process.env.HOST_IP}:5173`
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// mount routers
app.use(authRoutes);
app.use(userRoutes);
app.use(lobbyRoutes);
app.use(messageRoutes);
app.use(blobRoutes);
app.use(dom6Routes);
app.use(adminRoutes);

export default app;
