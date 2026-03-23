import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Tusenbruk — A Thousand Uses',
  description: 'Stories about the things we use, love, and live with. Watches. Cars. Pens. Cameras.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">Tusenbruk · A Thousand Uses</div>
          <div className="topbar-right">
            <Link href="/admin">Write</Link>
          </div>
        </div>

        {/* NAV */}
        <nav className="site-nav">
          <div className="nav-inner">
            <div>
              <Link href="/" className="wordmark">TUSEN<em>B</em>RUK</Link>
              <div className="wordmark-sub">A Thousand Uses</div>
            </div>
            <ul className="nav-links">
              <li><Link href="/">Stories</Link></li>
              <li><Link href="/?category=watches">Watches</Link></li>
              <li><Link href="/?category=cars">Cars</Link></li>
              <li><Link href="/?category=pens">Pens</Link></li>
              <li><Link href="/?category=cameras">Cameras</Link></li>
              <li><Link href="/shop">Shop</Link></li>
            </ul>
          </div>
        </nav>

        {children}

        {/* FOOTER */}
        <footer className="site-footer">
          <div className="footer-inner">
            <div>
              <div className="footer-brand">TUSEN<em>B</em>RUK</div>
              <div className="footer-tag">
                Stories about the things we use, love, and live with.
                Things worn beautifully by living.
              </div>
              <div className="footer-copy">© 2026 Tusenbruk</div>
            </div>
            <div className="footer-links">
              <Link href="/">Stories</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/admin">Write</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

