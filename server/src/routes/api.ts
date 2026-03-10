import { Router } from "express";
import { MapCell } from "../types";
import { BookingService } from "../services/booking";

export function createApiRouter(
  grid: MapCell[][],
  bookingService: BookingService
): Router {
  const router = Router();

  router.get("/map", (_req, res) => {
    res.json({ grid, cabanas: bookingService.getCabanas() });
  });

  router.get("/cabanas", (_req, res) => {
    res.json(bookingService.getCabanas());
  });

  router.get("/cabanas/:id", (req, res) => {
    const cabana = bookingService.getCabana(req.params.id);
    if (!cabana) {
      res.status(404).json({ error: "Cabana not found" });
      return;
    }
    res.json(cabana);
  });

  router.post("/cabanas/:id/book", (req, res) => {
    const { room, guestName } = req.body;

    if (!room || !guestName) {
      res.status(400).json({ error: "Room number and guest name are required" });
      return;
    }

    const result = bookingService.bookCabana(req.params.id, room, guestName);

    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ message: "Cabana booked successfully" });
  });

  return router;
}
