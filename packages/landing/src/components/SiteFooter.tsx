import { Divider } from 'cyberui-2045';
import { DEMO_NOTE, FOOTER_COLUMNS, PRODUCT_NAME, TAGLINE } from '../data/product';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <Divider />
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="wordmark">{PRODUCT_NAME}</span>
            <p>{TAGLINE}</p>
          </div>
          <nav className="footer-columns" aria-label="Footer">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="footer-heading">{column.title}</h2>
                <ul>
                  {column.links.map((label) => (
                    <li key={label}>
                      {/* MOCK: these links go nowhere. Give each a real href; preventDefault keeps the placeholder from jumping to the top and rewriting the URL. */}
                      <a href="#" onClick={(event) => event.preventDefault()}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="footer-legal">
          © {new Date().getFullYear()} {PRODUCT_NAME}. <span>{DEMO_NOTE}</span>
        </p>
      </div>
    </footer>
  );
}
