import { ImageResponse } from "next/og";
import { clinic } from "@/lib/site";

export const alt = "ALENTO — clínica de psicologia em São Paulo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: "#5f7a63" }}
          />
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              color: "#5f7a63",
              textTransform: "uppercase",
            }}
          >
            {clinic.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, color: "#1c1d1b", lineHeight: 1.08 }}>
            Um lugar tranquilo
          </div>
          <div style={{ fontSize: 78, color: "#5f7a63", lineHeight: 1.08 }}>
            para olhar para si
          </div>
          <div style={{ marginTop: 30, fontSize: 30, color: "#54564f" }}>
            {`Psicologia online e presencial · ${clinic.city}`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
