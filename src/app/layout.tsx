import type { Metadata } from "next";
import { Barlow_Condensed, Geist } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "100 Hard",
  description: "Private two-person accountability challenge.",
};

function DirectionContract() {
  const text = `
THESIS: Home is a load-rating plate for two athletes, not a habit-tracker dashboard. Perfect days are stamped capacity; spoons are brass proof marks; today is an inspection.
OWN-WORLD: Warm club-purple shop floor, iron plates, yellow proof marks, stamp type. Light and dark remap the same plate language. 8px corners, 1px edges.
STORY: Open to the race rack and today's inspection. Stamp your work. See why the other person is ahead or owes a spoon.
FIRST VIEWPORT: Serial header with countdown, two PFP load-pins on a rack to 31 Dec, own inspection plate, partner plate, bottom nav.
FORM: Equipment Spec Plate, grounded list position 7, seed cd602eee. Signature: a check lands as a stamp; a new perfect day slides the PFP pin 280ms ease-out.
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

const themeBoot = `(function(){try{var t=localStorage.getItem("100hard-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className={`${barlow.variable} ${geist.variable} antialiased`}>
        <DirectionContract />
        {children}
      </body>
    </html>
  );
}
