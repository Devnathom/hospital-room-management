import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | ระบบห้องพยาบาลโรงเรียน",
    default: "ระบบห้องพยาบาลโรงเรียน - Hospital Room Management",
  },
  description:
    "ระบบบริหารจัดการห้องพยาบาลโรงเรียน รองรับหลายโรงเรียน พัฒนาโดย รัชเดช ศรีแก้ว",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
