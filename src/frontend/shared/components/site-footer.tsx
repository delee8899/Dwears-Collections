import Link from "next/link";
import { socialLinks } from "../site-config";
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link className="brand" href="/">
            Dwears<small>Collections</small>
          </Link>
          <p>
            Secondhand style for the stories still to come. Curated with care,
            worn your way.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <div className="footer-links">
            <Link href="/shop">Shop all</Link>
            <Link href="/collections/clothing">Clothing</Link>
            <Link href="/collections/accessories">Accessories</Link>
          </div>
        </div>
        <div>
          <h2>Our story</h2>
          <div className="footer-links">
            <Link href="/#story">The Dwears difference</Link>
            <Link href="/#categories">Browse collections</Link>
          </div>
        </div>
        <div>
          <h2>Find us out there</h2>
          <div className="footer-links">
            {socialLinks.length ? (
              socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label} ↗
                </a>
              ))
            ) : (
              <span>Social profiles coming soon</span>
            )}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Dwears Collections. Good clothes, good
          stories.
        </span>
        <span>Shipping calculated at checkout</span>
      </div>
    </footer>
  );
}
