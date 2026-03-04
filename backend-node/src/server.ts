import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.PORT ?? 3333);

// Initialize MinIO bucket on startup (non-fatal if MinIO is not configured)
import("./modules/storage/storage.service")
  .then(({ ensureBucket }) => ensureBucket())
  .catch((err) => console.warn("MinIO bucket init skipped:", (err as Error).message));

app.listen(port, () => {
  console.log(`Backend Node running on port ${port}`);
});
