import express from "express";
import cors from "cors";
import path from "path";
import { parseMap } from "./services/mapParser";
import { BookingService } from "./services/booking";
import { createApiRouter } from "./routes/api";

function parseArgs(): { mapPath: string; bookingsPath: string } {
  const args = process.argv.slice(2);
  let mapPath = path.resolve("maps/map.ascii");
  let bookingsPath = path.resolve("bookings/bookings.json");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--map" && args[i + 1]) {
      mapPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === "--bookings" && args[i + 1]) {
      bookingsPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { mapPath, bookingsPath };
}

function main() {
  const { mapPath, bookingsPath } = parseArgs();

  console.log(`Loading map from: ${mapPath}`);
  console.log(`Loading bookings from: ${bookingsPath}`);

  const { grid, cabanas } = parseMap(mapPath);
  console.log(
    `Map loaded: ${grid.length} rows, ${grid[0]?.length || 0} cols, ${cabanas.length} cabanas`
  );

  const bookingService = new BookingService(bookingsPath, cabanas);

  const app = express();
  app.use(cors());
  app.use(express.json());

  const assetsDir = path.resolve("assets");
  app.use("/assets", express.static(assetsDir));

  app.use("/api", createApiRouter(grid, bookingService));

  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main();
