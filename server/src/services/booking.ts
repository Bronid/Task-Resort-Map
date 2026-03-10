import * as fs from "fs";
import { Guest, CabanaInfo } from "../types";

export class BookingService {
  private guests: Guest[];
  private cabanas: Map<string, CabanaInfo>;

  constructor(bookingsPath: string, cabanas: CabanaInfo[]) {
    const raw = fs.readFileSync(bookingsPath, "utf-8");
    this.guests = JSON.parse(raw) as Guest[];

    this.cabanas = new Map();
    for (const cab of cabanas) {
      this.cabanas.set(cab.id, { ...cab });
    }
  }

  getCabanas(): CabanaInfo[] {
    return Array.from(this.cabanas.values());
  }

  getCabana(id: string): CabanaInfo | undefined {
    return this.cabanas.get(id);
  }

  validateGuest(room: string, guestName: string): boolean {
    return this.guests.some(
      (g) => g.room === room && g.guestName.toLowerCase() === guestName.toLowerCase()
    );
  }

  bookCabana(
    cabanaId: string,
    room: string,
    guestName: string
  ): { ok: boolean; error?: string } {
    const cabana = this.cabanas.get(cabanaId);

    if (!cabana) {
      return { ok: false, error: "Cabana not found" };
    }

    if (cabana.booked) {
      return { ok: false, error: "This cabana is already booked" };
    }

    if (!this.validateGuest(room, guestName)) {
      return {
        ok: false,
        error: "Invalid room number or guest name. Please check your details.",
      };
    }

    cabana.booked = true;
    cabana.bookedBy = { room, guestName };
    return { ok: true };
  }
}
