import { MapData } from "./types";

const BASE = "";

export async function fetchMap(): Promise<MapData> {
  const res = await fetch(`${BASE}/api/map`);
  if (!res.ok) throw new Error("Failed to load map");
  return res.json();
}

export async function bookCabana(
  cabanaId: string,
  room: string,
  guestName: string
): Promise<{ message?: string; error?: string }> {
  const res = await fetch(`${BASE}/api/cabanas/${cabanaId}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, guestName }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Booking failed");
  }
  return data;
}
