import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const serverRoot = fileURLToPath(new URL("../../", import.meta.url));

const envFiles = [
  process.env.SPARVI_ENV_FILE,
  ".env.private",
  ".env.local",
  ".env",
].filter(Boolean);

for (const file of envFiles) {
  config({
    path: path.isAbsolute(file) ? file : path.join(serverRoot, file),
    override: false,
  });
}
