import { ImageResponse } from "next/og";
import { PALETTE } from "@/lib/palette";

export const alt = "100 Hard — private two-person accountability challenge.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PALETTE.canvas,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 760,
            height: 340,
            background: PALETTE.iron,
            border: `2px solid ${PALETTE.steel}`,
            borderRadius: 8,
            color: PALETTE.ink,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: 18, left: 18, width: 10, height: 10, borderRadius: 5, background: PALETTE.proof }} />
          <div style={{ position: "absolute", top: 18, left: 732, width: 10, height: 10, borderRadius: 5, background: PALETTE.proof }} />
          <div style={{ position: "absolute", top: 312, left: 18, width: 10, height: 10, borderRadius: 5, background: PALETTE.proof }} />
          <div style={{ position: "absolute", top: 312, left: 732, width: 10, height: 10, borderRadius: 5, background: PALETTE.proof }} />
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}
          >
            100 HARD
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 22,
              letterSpacing: "0.08em",
              color: PALETTE.steel,
            }}
          >
            PRIVATE TWO-PERSON CHALLENGE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 20,
              letterSpacing: "0.06em",
              color: PALETTE.steel,
            }}
          >
            22 SEP 2026 — 31 DEC 2026
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
