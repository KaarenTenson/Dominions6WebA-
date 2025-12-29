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


const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
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

export default app;
