import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { BookingService } from "../services/booking";
import { CabanaInfo } from "../types";

const BOOKINGS_PATH = path.resolve(__dirname, "../../../bookings.json");

function makeCabanas(): CabanaInfo[] {
  return [
    { id: "cabana-1", row: 11, col: 3, booked: false },
    { id: "cabana-2", row: 11, col: 4, booked: false },
    { id: "cabana-3", row: 11, col: 5, booked: false },
  ];
}

describe("BookingService", () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService(BOOKINGS_PATH, makeCabanas());
  });

  it("should return all cabanas", () => {
    const cabanas = service.getCabanas();
    expect(cabanas).toHaveLength(3);
  });

  it("should validate a correct guest", () => {
    expect(service.validateGuest("101", "Alice Smith")).toBe(true);
  });

  it("should reject an invalid guest", () => {
    expect(service.validateGuest("101", "Wrong Name")).toBe(false);
    expect(service.validateGuest("999", "Alice Smith")).toBe(false);
  });

  it("should book a cabana with valid guest data", () => {
    const result = service.bookCabana("cabana-1", "101", "Alice Smith");
    expect(result.ok).toBe(true);

    const cabana = service.getCabana("cabana-1");
    expect(cabana?.booked).toBe(true);
    expect(cabana?.bookedBy?.room).toBe("101");
  });

  it("should reject booking with invalid guest data", () => {
    const result = service.bookCabana("cabana-1", "101", "Wrong Name");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Invalid");
  });

  it("should reject booking an already booked cabana", () => {
    service.bookCabana("cabana-1", "101", "Alice Smith");
    const result = service.bookCabana("cabana-1", "102", "Bob Jones");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("already booked");
  });

  it("should reject booking a non-existent cabana", () => {
    const result = service.bookCabana("cabana-999", "101", "Alice Smith");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("should validate guest name case-insensitively", () => {
    expect(service.validateGuest("101", "alice smith")).toBe(true);
    expect(service.validateGuest("101", "ALICE SMITH")).toBe(true);
    expect(service.validateGuest("101", "aLiCe SmItH")).toBe(true);
  });
});
