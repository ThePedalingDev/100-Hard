"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#181a1b", color: "#f2f0eb", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
          <section
            style={{
              width: "100%",
              maxWidth: 480,
              border: "1px solid #8b8f9159",
              background: "#25282a",
              padding: 20,
              borderRadius: 8,
            }}
          >
            <h1 style={{ margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Could not load the plate
            </h1>
            <p style={{ color: "#8b8f91", marginTop: 12 }}>
              The server failed while rendering this screen. Try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: 24,
                width: "100%",
                minHeight: 44,
                border: 0,
                background: "#f2f0eb",
                color: "#181a1b",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: 8,
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
