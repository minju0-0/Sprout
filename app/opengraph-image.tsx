// app/opengraph-image.tsx
import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#eef1e4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            background: "#3f6b3a",
            borderRadius: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 64,
              height: 80,
              background: "#e8a33d",
              borderRadius: "0 100% 0 100%",
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: "#262a1f" }}>
          Sprout
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#5c6152" }}>
          The Living Budget Garden
        </div>
      </div>
    ),
    size,
  );
}