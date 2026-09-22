import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { PageEnter } from "@/components/page-enter";
import { RouteProgress } from "@/components/route-progress";
import { SafariChrome } from "@/components/safari-chrome";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const display = localFont({
  src: "../fonts/BricolageGrotesque-latin-wght.woff2",
  variable: "--font-display-face",
  display: "swap",
  weight: "500 800",
});

const body = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E3ECF4",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "100 Hard",
  description: "Private invite-only accountability challenge.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "100 Hard",
    description: "Private invite-only accountability challenge.",
  },
  twitter: {
    card: "summary_large_image",
    title: "100 Hard",
    description: "Private invite-only accountability challenge.",
  },
};

function DirectionContract() {
  const text = `
THESIS: Home is a load-rating plate for a private group, not a habit-tracker dashboard. Perfect days are stamped capacity; spoons are orange proof marks; today is an inspection.
OWN-WORLD: Daylight locker paper, white inspection plates, navy ink, SA Planet Fitness orange proof marks and yellow focus. Bricolage Grotesque display, Atkinson Hyperlegible body. 8px corners, 1px edges. Light only. No purple. No dark theme.
STORY: Open to the leaderboard and today's inspection. Stamp your work. See why another member is ahead or owes a spoon.
FIRST VIEWPORT: Serial header with countdown, group leaderboard, own inspection plate, member plates, six-item bottom nav.
FORM: Equipment Spec Plate, grounded list position 7, seed cd602eee. Signature: a check lands as a stamp; a new perfect day slides the PFP pin 280ms ease-out; pages enter 10px and fade on expo ease.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`.trim();

  return (
    <div
      aria-hidden="true"
      hidden
      dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <DirectionContract />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SafariChrome />
        <RouteProgress />
        <ToastProvider>
          <div id="main-content" tabIndex={-1} className="focus:outline-none">
            <PageEnter isolate>{children}</PageEnter>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
