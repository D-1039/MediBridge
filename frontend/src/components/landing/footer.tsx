import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer id="about" className="border-t bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-muted-foreground max-w-md leading-relaxed">
              MediBridge is an AI-powered platform reducing medicine waste and
              connecting surplus medicines with patients in need through verified
              NGOs and pharmacists.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Donor Login</Link></li>
              <li>
                <Link
                  href="/login?portal=pharmacist"
                  className="hover:text-foreground transition-colors font-medium text-green-600 dark:text-green-400"
                >
                  Pharmacist Login (Approve / Reject)
                </Link>
              </li>
              <li><Link href="/dashboard/upload" className="hover:text-foreground transition-colors">Donate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contact@medibridge.health
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              {[
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-blue-600/10 hover:text-blue-600 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MediBridge. Built for healthcare sustainability.
        </div>
      </div>
    </footer>
  );
}
