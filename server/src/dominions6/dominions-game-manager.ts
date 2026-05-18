import { writeLog } from "../db/db-dom6.writers.js";
import { getEnv } from "../utils/env-utils.js";
import { Dominions6Cofing, Result } from "../types.js";
import { ChildProcess, exec } from "node:child_process";
const ActiveProccesses = new Map<string, ChildProcess>();
export const newGame = (config: Dominions6Cofing): Result<void> => {
  makeNewGame(config.name);
  makeCommandFromConfig(config);
  return {};
};
const makeNewGame = (name: string) => {
  const gamePath = getEnv("DOMINIONS6_BIN");
  exec(`${gamePath} --newgame ${name}`, (error, stdout, stderr) => {
    if (error) {
    }
  });
};
const restartGame = (name: string) => {
  const procc = ActiveProccesses.get(name);
  procc?.kill(9);
  const gamePath = getEnv("DOMINIONS6_BIN");
  ActiveProccesses.set(name, exec(`${gamePath} -ST ${name}`));
};
const makeCommandFromConfig = (config: Dominions6Cofing): string => {
  const nationMap = { EA: "1", MA: "2", LA: "3" };
  const gamePath = getEnv("DOMINIONS6_BIN");
  ActiveProccesses.set(
    config.name,
    exec(
      `${gamePath} --tcpserver ${config.name} -T --ipadr 0.0.0.0 --port ${
        config.port
      } --era ${nationMap[config.age]} `,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error:", error);
          writeLog(error.message, "START ERROR");
          return error;
        }
        if (stderr) {
          writeLog(stderr, "START STDERR");
          return error;
        }
        if (stdout) {
          writeLog(stderr, "START STDOUT");
        }
      }
    )
  );
  return "";
};
