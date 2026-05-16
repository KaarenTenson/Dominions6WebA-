// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.ts";
import userRoutes from "./routes/user.routes.ts";
import lobbyRoutes from "./routes/lobby.routes.ts";
import messageRoutes from "./routes/message.routes.ts";
import blobRoutes from "./routes/blob.routes.ts";
import dom6Routes from "./routes/dom6.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";


const app = express();

app.use(cookieParser());
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.176:5173" // Add your network IP here
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
