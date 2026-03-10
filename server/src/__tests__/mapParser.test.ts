import { describe, it, expect } from "vitest";
import path from "path";
import { parseMap, parseMapContent } from "../services/mapParser";

const MAP_PATH = path.resolve(__dirname, "../../../map.ascii");

describe("mapParser", () => {
  it("should parse the map file without errors", () => {
    const { grid, cabanas } = parseMap(MAP_PATH);
    expect(grid.length).toBeGreaterThan(0);
    expect(grid[0].length).toBeGreaterThan(0);
    expect(cabanas.length).toBeGreaterThan(0);
  });

  it("should assign unique IDs to all cabana cells", () => {
    const { cabanas } = parseMap(MAP_PATH);
    const ids = cabanas.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should mark all cabanas as not booked initially", () => {
    const { cabanas } = parseMap(MAP_PATH);
    for (const cab of cabanas) {
      expect(cab.booked).toBe(false);
    }
  });

  it("should correctly identify cell types from the map", () => {
    const { grid } = parseMap(MAP_PATH);

    for (const cell of grid[0]) {
      expect(cell.type).toBe(".");
    }

    const row2Types = grid[1].map((c) => c.type);
    expect(row2Types).toContain("c");

    const row3Types = grid[2].map((c) => c.type);
    expect(row3Types).toContain("#");
  });

  it("should assign path tiles and rotations to # cells", () => {
    const { grid } = parseMap(MAP_PATH);
    const pathCells = grid.flat().filter((c) => c.type === "#");

    for (const cell of pathCells) {
      expect(cell.pathTile).toBeDefined();
      expect(cell.rotation).toBeDefined();
      expect([
        "arrowEnd",
        "arrowStraight",
        "arrowCornerSquare",
        "arrowSplit",
        "arrowCrossing",
      ]).toContain(cell.pathTile);
      expect([0, 90, 180, 270]).toContain(cell.rotation);
    }
  });

  it("should find W cells in the pool area rows", () => {
    const { grid } = parseMap(MAP_PATH);
    const row11Types = grid[11].map((c) => c.type);
    expect(row11Types).toContain("W");
  });
});

describe("path tile logic", () => {
  function tile(ascii: string, row: number, col: number) {
    const { grid } = parseMapContent(ascii);
    return { pathTile: grid[row][col].pathTile, rotation: grid[row][col].rotation };
  }

  it("should detect a dead-end path (arrowEnd)", () => {
    const map = [
      "...",
      ".#.",
      "...",
    ].join("\n");
    expect(tile(map, 1, 1).pathTile).toBe("arrowEnd");
  });

  it("should detect a vertical straight path", () => {
    const map = [
      ".#.",
      ".#.",
      ".#.",
    ].join("\n");
    const t = tile(map, 1, 1);
    expect(t.pathTile).toBe("arrowStraight");
    expect(t.rotation).toBe(0);
  });

  it("should detect a horizontal straight path", () => {
    const map = [
      "...",
      "###",
      "...",
    ].join("\n");
    const t = tile(map, 1, 1);
    expect(t.pathTile).toBe("arrowStraight");
    expect(t.rotation).toBe(90);
  });

  it("should detect a corner (up + right)", () => {
    const map = [
      ".#.",
      ".##",
      "...",
    ].join("\n");
    const t = tile(map, 1, 1);
    expect(t.pathTile).toBe("arrowCornerSquare");
    expect(t.rotation).toBe(0);
  });

  it("should detect a corner (down + left)", () => {
    const map = [
      "...",
      "##.",
      ".#.",
    ].join("\n");
    const t = tile(map, 1, 1);
    expect(t.pathTile).toBe("arrowCornerSquare");
    expect(t.rotation).toBe(180);
  });

  it("should detect a T-junction (arrowSplit)", () => {
    const map = [
      ".#.",
      ".##",
      ".#.",
    ].join("\n");
    const t = tile(map, 1, 1);
    expect(t.pathTile).toBe("arrowSplit");
    expect(t.rotation).toBe(0);
  });

  it("should detect a crossing", () => {
    const map = [
      ".#.",
      "###",
      ".#.",
    ].join("\n");
    const t = tile(map, 1, 1);
    expect(t.pathTile).toBe("arrowCrossing");
    expect(t.rotation).toBe(0);
  });

  it("should add chalet connection to adjacent path tile", () => {
    const map = [
      "...",
      "c#.",
      "...",
    ].join("\n");
    const { grid } = parseMapContent(map);
    const pathCell = grid[1][1];
    expect(pathCell.pathTile).toBe("arrowEnd");
  });
});
