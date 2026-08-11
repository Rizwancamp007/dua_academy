import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

export function Footer() {
  const contactNumbers = [
    "0333-5524440",
    "0333-7092389",
    "0300-2132072",
    "0301-3679918",
    "0300-3159757",
    "0311-3432433",
  ];

  return (
    <footer className="w-full border-t border-border bg-surface text-text mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col space-y-4 col-span-1 md:col-span-2">
            <Logo showText={true} />
            <p className="text-sm font-serif italic text-primary dark:text-secondary">
              "Your Future. Our Commitment. Your Success."
            </p>
            <p className="text-sm text-text/70 max-w-sm">
              Celebrating 20 Years of Educational Excellence in Mirpur Mathelo, preparing students for board exams (IX, X, XI, XII) and competitive entrance tests (MDCAT, ECAT).
            </p>
            {/* Social Links */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://facebook.com/duaaacademymirpur"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                aria-label="Facebook Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@duaacademymirpurmathelo9633"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                aria-label="YouTube Channel"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163c-.272-1.216-1.14-2.197-2.314-2.482-2.043-.493-10.184-.493-10.184-.493s-8.14 0-10.184.493c-1.173.285-2.04 1.266-2.312 2.482-.493 2.043-.493 6.304-.493 6.304s0 4.261.493 6.305c.272 1.216 1.14 2.196 2.312 2.48 2.043.494 10.184.494 10.184.494s8.14 0 10.184-.494c1.173-.284 2.04-1.264 2.314-2.48.493-2.044.493-6.305.493-6.305s0-4.261-.493-6.304zm-14.498 9.502v-7.33l6.5 3.665-6.5 3.665z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-bold mb-4 border-b border-border/50 pb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm text-text/70">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/lectures" className="hover:text-primary transition-colors">Lectures</Link>
              </li>
              <li>
                <Link href="/faculty" className="hover:text-primary transition-colors">Faculty Profiles</Link>
              </li>
              <li>
                <Link href="/wall-of-honor" className="hover:text-primary transition-colors">Wall of Honor</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary transition-colors">Media Gallery</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact Page</Link>
              </li>
            </ul>
          </div>

          {/* Contacts info */}
          <div>
            <h4 className="font-serif text-base font-bold mb-4 border-b border-border/50 pb-2">Get in Touch</h4>
            <div className="space-y-4 text-sm text-text/70">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Ikhlas Model High School, Mirpur Mathelo</span>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <a href="mailto:duaacademymirpur@gmail.com" className="hover:underline">duaacademymirpur@gmail.com</a>
              </div>
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  {contactNumbers.slice(0, 3).map((num) => (
                    <span key={num}>{num}</span>
                  ))}
                  <details className="cursor-pointer select-none">
                    <summary className="text-primary hover:underline text-xs">Show more</summary>
                    <div className="flex flex-col space-y-1 pt-1">
                      {contactNumbers.slice(3).map((num) => (
                        <span key={num}>{num}</span>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Right */}
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-text/50">
          <p>© {new Date().getFullYear()} Duaa Academy, Mirpur Mathelo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
