import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import path from "path";
import { parseMap } from "../services/mapParser";
import { BookingService } from "../services/booking";
import { createApiRouter } from "../routes/api";

const MAP_PATH = path.resolve(__dirname, "../../../map.ascii");
const BOOKINGS_PATH = path.resolve(__dirname, "../../../bookings.json");

describe("API", () => {
  let app: express.Application;

  beforeEach(() => {
    const { grid, cabanas } = parseMap(MAP_PATH);
    const bookingService = new BookingService(BOOKINGS_PATH, cabanas);

    app = express();
    app.use(express.json());
    app.use("/api", createApiRouter(grid, bookingService));
  });

  it("GET /api/map should return grid and cabanas", async () => {
    const res = await request(app).get("/api/map");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("grid");
    expect(res.body).toHaveProperty("cabanas");
    expect(Array.isArray(res.body.grid)).toBe(true);
    expect(Array.isArray(res.body.cabanas)).toBe(true);
    expect(res.body.cabanas.length).toBeGreaterThan(0);
  });

  it("GET /api/cabanas should return list of cabanas", async () => {
    const res = await request(app).get("/api/cabanas");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/cabanas/:id should return a specific cabana", async () => {
    const res = await request(app).get("/api/cabanas/cabana-1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("cabana-1");
  });

  it("GET /api/cabanas/:id should return 404 for unknown cabana", async () => {
    const res = await request(app).get("/api/cabanas/cabana-9999");
    expect(res.status).toBe(404);
  });

  it("POST /api/cabanas/:id/book should book with valid data", async () => {
    const res = await request(app)
      .post("/api/cabanas/cabana-1/book")
      .send({ room: "101", guestName: "Alice Smith" });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("successfully");
  });

  it("POST /api/cabanas/:id/book should reject invalid guest", async () => {
    const res = await request(app)
      .post("/api/cabanas/cabana-2/book")
      .send({ room: "101", guestName: "Wrong Name" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("POST /api/cabanas/:id/book should reject already booked cabana", async () => {
    await request(app)
      .post("/api/cabanas/cabana-1/book")
      .send({ room: "101", guestName: "Alice Smith" });

    const res = await request(app)
      .post("/api/cabanas/cabana-1/book")
      .send({ room: "102", guestName: "Bob Jones" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("already booked");
  });

  it("POST /api/cabanas/:id/book should reject missing fields", async () => {
    const res = await request(app)
      .post("/api/cabanas/cabana-3/book")
      .send({ room: "101" });
    expect(res.status).toBe(400);
  });
});
