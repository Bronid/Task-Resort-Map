import React from "react";
import { MapCell, CabanaInfo } from "../types";

function getAssetSrc(cell: MapCell): string | null {
  switch (cell.type) {
    case "W":
      return "/assets/cabana.png";
    case "p":
      return "/assets/textureWater.png";
    case "c":
      return "/assets/houseChimney.png";
    case "#":
      return `/assets/${cell.pathTile || "arrowStraight"}.png`;
    default:
      return null;
  }
}

interface Props {
  cell: MapCell;
  tileSize: number;
  cabana?: CabanaInfo;
  onClick?: () => void;
}

const MapTile: React.FC<Props> = ({ cell, tileSize, cabana, onClick }) => {
  const isCabana = cell.type === "W";
  const isBooked = cabana?.booked ?? false;

  const classes = [
    "map-tile",
    isCabana ? "cabana" : "",
    isBooked ? "booked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rotation = cell.rotation || 0;
  const imgStyle: React.CSSProperties =
    rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  const src = getAssetSrc(cell);

  return (
    <div
      className={classes}
      style={{ width: tileSize, height: tileSize }}
      onClick={isCabana ? onClick : undefined}
      title={
        isCabana
          ? isBooked
            ? `${cell.cabanaId} (booked)`
            : `${cell.cabanaId} (available)`
          : undefined
      }
    >
      {src && <img src={src} alt={cell.type} style={imgStyle} />}
    </div>
  );
};

export default MapTile;
