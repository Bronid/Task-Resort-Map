import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapData, CabanaInfo } from "../types";
import { fetchMap } from "../api";
import MapTile from "./MapTile";
import BookingModal from "./BookingModal";

const MAX_TILE = 48;

const ResortMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [selectedCabana, setSelectedCabana] = useState<CabanaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tileSize, setTileSize] = useState(MAX_TILE);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMap = async () => {
    try {
      const data = await fetchMap();
      setMapData(data);
      setError("");
    } catch {
      setError("Failed to load resort map");
    } finally {
      setLoading(false);
    }
  };

  const cols = mapData?.grid[0]?.length || 0;

  const updateTileSize = useCallback(() => {
    const container = containerRef.current;
    if (!container || cols === 0) return;
    const available = container.clientWidth;
    setTileSize(Math.min(MAX_TILE, Math.floor(available / cols)));
  }, [cols]);

  useEffect(() => {
    loadMap();
  }, []);

  useEffect(() => {
    updateTileSize();
    window.addEventListener("resize", updateTileSize);
    return () => window.removeEventListener("resize", updateTileSize);
  }, [updateTileSize]);

  const handleCabanaClick = (cabanaId: string) => {
    if (!mapData) return;
    const cabana = mapData.cabanas.find((c) => c.id === cabanaId);
    if (cabana) setSelectedCabana(cabana);
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: 40 }}>Loading map...</p>;
  }

  if (error || !mapData) {
    return <p style={{ textAlign: "center", padding: 40, color: "#e94560" }}>{error}</p>;
  }

  const cabanaMap = new Map<string, CabanaInfo>();
  mapData.cabanas.forEach((c) => cabanaMap.set(c.id, c));

  return (
    <>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-swatch" style={{ background: "#4ecca3" }} />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch" style={{ background: "rgba(220, 40, 40, 0.7)" }} />
          <span>Booked</span>
        </div>
      </div>

      <div className="map-container" ref={containerRef}>
        <div
          className="map-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, ${tileSize}px)` }}
        >
          {mapData.grid.flat().map((cell) => (
            <MapTile
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              tileSize={tileSize}
              cabana={cell.cabanaId ? cabanaMap.get(cell.cabanaId) : undefined}
              onClick={() =>
                cell.cabanaId ? handleCabanaClick(cell.cabanaId) : undefined
              }
            />
          ))}
        </div>
      </div>

      {selectedCabana && (
        <BookingModal
          cabana={selectedCabana}
          onClose={() => setSelectedCabana(null)}
          onBooked={loadMap}
        />
      )}
    </>
  );
};

export default ResortMap;
