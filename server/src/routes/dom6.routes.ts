import { Router } from "express";
import { getNations } from "../db/db-dom6-reading";

const router = Router();
router.get("/dom6/nation", (req, res) => {
  return res.json(getNations());
});
export default router;
