import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { strict: false } }],
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default config;
