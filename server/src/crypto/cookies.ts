import { Result, SessionCookie } from "../../types";
import { readSession } from "../db/db-reading";
import { writeSession } from "../db/db-writer";
import type { Response } from "express";
import { logger } from "../logger/logger";
const sessionCache = new Map<string, SessionCookie>();

export const createCookies = (userId: string, res: Response): Result<void> => {
  try {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 100 * 24 * 60 * 60 * 1000;
    const result = writeSession({
      sessionId: sessionId,
      userId: userId,
      expiresAt: expiresAt,
    });
    if (result.error) {
      return result;
    }

    res.cookie("session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 100 * 24 * 60 * 60 * 1000,
    });
    return {};
  } catch (error) {
    return { error: "uwuw midagi läks valesti" };
  }
};

export const getSession = (sessionId: string): SessionCookie | null => {
  const cached = sessionCache.get(sessionId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const dbResult = readSession(sessionId); // implement in DB
  if (dbResult.error) {
    logger.error(dbResult.error);
  }
  if (dbResult.error || !dbResult.data) return null;
  sessionCache.set(sessionId, dbResult.data);
  if (dbResult.data.expiresAt < Date.now()) {
    return null;
  }
  return dbResult.data;
};

export const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, decodeURIComponent(v.join("="))];
    })
  );
};
