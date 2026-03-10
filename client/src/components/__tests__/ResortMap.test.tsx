import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ResortMap from "../ResortMap";
import { MapData } from "../../types";

const mockMapData: MapData = {
  grid: [
    [
      { type: ".", row: 0, col: 0 },
      { type: "W", row: 0, col: 1, cabanaId: "cabana-1" },
      { type: "p", row: 0, col: 2 },
    ],
  ],
  cabanas: [{ id: "cabana-1", row: 0, col: 1, booked: false }],
};

vi.mock("../../api", () => ({
  fetchMap: vi.fn(),
  bookCabana: vi.fn(),
}));

import { fetchMap } from "../../api";
const mockFetchMap = vi.mocked(fetchMap);

describe("ResortMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchMap.mockReturnValue(new Promise(() => {}));
    render(<ResortMap />);
    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  it("should render map tiles after loading", async () => {
    mockFetchMap.mockResolvedValue(mockMapData);
    render(<ResortMap />);

    await waitFor(() => {
      const tiles = document.querySelectorAll(".map-tile");
      expect(tiles.length).toBe(3);
    });
  });

  it("should show error if fetch fails", async () => {
    mockFetchMap.mockRejectedValue(new Error("Network error"));
    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load resort map")).toBeInTheDocument();
    });
  });

  it("should open modal when clicking on a cabana tile", async () => {
    mockFetchMap.mockResolvedValue(mockMapData);
    render(<ResortMap />);

    await waitFor(() => {
      expect(document.querySelector(".map-tile.cabana")).toBeInTheDocument();
    });

    fireEvent.click(document.querySelector(".map-tile.cabana")!);

    await waitFor(() => {
      expect(screen.getByText("Room Number")).toBeInTheDocument();
    });
  });
});
