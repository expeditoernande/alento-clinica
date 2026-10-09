import { ImageResponse } from "next/og";

export const alt = "ALENTO — clínica de psicologia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#eef2ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              color: "#5f7a63",
            }}
          >
            A
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#1c1d1b",
            }}
          >
            <span>Alento</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 88, height: 6, background: "#5f7a63", borderRadius: 999 }} />
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: "#1c1d1b",
              maxWidth: 900,
            }}
          >
            Um lugar tranquilo para olhar para si
          </div>
          <div style={{ fontSize: 30, color: "#4c4d49", maxWidth: 820 }}>
            Clínica de psicologia · atendimento online e presencial · agende pela sua conta
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#8b8b83",
            borderTop: "2px solid #e4e1d8",
            paddingTop: 24,
          }}
        >
          <span>alento.com.br</span>
          <span>CRP ativo · sigilo profissional</span>
        </div>
      </div>
    ),
    size,
  );
}
