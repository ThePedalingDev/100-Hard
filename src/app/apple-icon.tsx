import { ImageResponse } from "next/og";
import { PALETTE } from "@/lib/palette";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PALETTE.iron,
          color: PALETTE.ink,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "0.04em",
          border: `4px solid ${PALETTE.steel}`,
        }}
      >
        100
      </div>
    ),
    { ...size },
  );
}
