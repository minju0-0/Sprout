import { ImageResponse } from "next/og";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3f6b3a",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 16,
            height: 20,
            background: "#e8a33d",
            borderRadius: "0 100% 0 100%",
          }}
        />
      </div>
    ),
    size,
  );
}
