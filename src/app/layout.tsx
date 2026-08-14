import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FleetLog — Fuel & Fleet Expense Tracker",
    template: "%s · FleetLog",
  },
  description:
    "FleetLog helps Ghanaian transport operators log fuel purchases, track efficiency, and manage vehicle maintenance in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
