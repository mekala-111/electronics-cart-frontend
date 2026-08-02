import Link from "next/link";
import { MapPin, Phone, MessageCircle, ShieldCheck, Shield, RotateCcw } from "lucide-react";
import { PageShell } from "./page-shell";

/** Flutter TopBar — 48px dark navy */
export function TopBar() {
  return (
    <div className="hidden h-12 bg-navy text-white md:block">
      <PageShell maxWidth={null} className="flex h-full items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 opacity-90" />
          Delivering to Hyderabad, 500038
        </span>
        <div className="mx-auto flex items-center">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 opacity-90" />
            Certified Refurbished
          </span>
          <span className="mx-4 h-3.5 w-px bg-white/28" />
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 opacity-90" />
            1 Year Warranty
          </span>
          <span className="mx-4 h-3.5 w-px bg-white/28" />
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 opacity-90" />
            Easy Returns
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-white/85">Need Help?</span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 opacity-90" />
            040-4856 7878
          </span>
          <Link href="/support" className="inline-flex items-center gap-1.5 hover:underline">
            <MessageCircle className="h-3.5 w-3.5 opacity-90" />
            WhatsApp
          </Link>
        </div>
      </PageShell>
    </div>
  );
}
