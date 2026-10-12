import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const foundationItems = [
  {
    number: "01",
    title: "A quick digital menu",
    description: "A clear place for meals, descriptions, prices and availability.",
  },
  {
    number: "02",
    title: "Restaurant details",
    description: "Opening hours, location, contact details and the restaurant story.",
  },
  {
    number: "03",
    title: "Ordering and bookings",
    description: "A foundation for WhatsApp-assisted orders and table reservations.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <Container className="site-header__inner">
          <a className="brand" href="/" aria-label="Restaurant Platform home">
            <span className="brand__mark" aria-hidden="true">R</span>
            <span>
              <strong>Restaurant Platform</strong>
              <small>Good food starts here</small>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#foundation">Our approach</a>
          </nav>
          <a className="header-link" href="#foundation">Explore the foundation <span aria-hidden="true">↗</span></a>
        </Container>
      </header>

      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <Container className="hero__grid">
          <div className="hero__content">
            <p className="eyebrow"><span className="status-dot" /> PHASE 1 · FOUNDATION</p>
            <h1>Your restaurant.<br /><span>Your menu.</span><br />One simple experience.</h1>
            <p className="hero__description">
              A mobile-first foundation for restaurants to showcase their food,
              share accurate prices and help customers know what to expect before they visit.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#features">
                Explore the foundation <span aria-hidden="true">↓</span>
              </a>
              <a className="text-link" href="#foundation">Built to grow carefully <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero__trust">
              <span className="trust-icon" aria-hidden="true">✓</span>
              <p><strong>Simple by design</strong><br />Responsive, configurable and ready for the next phase.</p>
            </div>
          </div>

          <div className="preview-wrap" aria-label="Illustrative mobile restaurant menu preview">
            <div className="preview-decoration preview-decoration--one" />
            <div className="preview-decoration preview-decoration--two" />
            <div className="phone">
              <div className="phone__notch" />
              <div className="phone__screen">
                <div className="phone__status"><span>9:41</span><span>● ▰ ▴</span></div>
                <div className="phone__nav">
                  <span className="mini-logo">R</span>
                  <strong>Your Restaurant</strong>
                  <span className="menu-icon">☰</span>
                </div>
                <div className="phone__hero">
                  <span className="phone__tag">FRESHLY PREPARED</span>
                  <h2>Good food.<br />Good moments.</h2>
                  <p>Discover your next favourite meal.</p>
                  <span className="phone__fake-button">Explore menu&nbsp; ↗</span>
                </div>
                <div className="phone__menu">
                  <div className="phone__section-title"><strong>Popular today</strong><span>View all →</span></div>
                  <div className="food-row">
                    <div className="food-art food-art--one" aria-hidden="true"><span>🍲</span></div>
                    <div><strong>Home-style meal</strong><small>Fresh, filling and tasty</small><b>Price set by restaurant</b></div>
                  </div>
                  <div className="food-row">
                    <div className="food-art food-art--two" aria-hidden="true"><span>🍛</span></div>
                    <div><strong>Today's special</strong><small>Made with care</small><b>Price set by restaurant</b></div>
                  </div>
                </div>
                <div className="phone__bottom">⌂ &nbsp;&nbsp;&nbsp; Menu &nbsp;&nbsp;&nbsp; ♡ &nbsp;&nbsp;&nbsp; Contact</div>
              </div>
            </div>
            <div className="floating-note floating-note--top"><span className="floating-note__icon">↗</span><span><strong>Made for mobile</strong><small>Small screen first</small></span></div>
            <div className="floating-note floating-note--bottom"><span className="floating-note__icon floating-note__icon--gold">KSh</span><span><strong>Clear menu pricing</strong><small>No hidden surprises</small></span></div>
          </div>
        </Container>
      </section>

      <section className="stats-strip" aria-label="Foundation principles">
        <Container className="stats-strip__inner">
          <div><strong>Mobile-first</strong><span>Designed for phone screens</span></div>
          <div><strong>Database-ready</strong><span>Content belongs to the business</span></div>
          <div><strong>Multi-restaurant</strong><span>Built for reusable configuration</span></div>
        </Container>
      </section>

      <section className="features section" id="features">
        <Container>
          <SectionHeading
            eyebrow="THE FOUNDATION"
            title="Everything important. Nothing unnecessary."
            description="Start with a reliable base. Add real restaurant features when the foundation is ready."
          />
          <div className="feature-grid">
            {foundationItems.map((item) => (
              <article className="feature-card" key={item.number}>
                <span className="feature-card__number">{item.number}</span>
                <div className="feature-card__icon" aria-hidden="true">
                  {item.number === "01" ? "▤" : item.number === "02" ? "⌖" : "↗"}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="feature-card__footer">Foundation capability <span>↗</span></span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="approach section" id="foundation">
        <Container className="approach__grid">
          <div>
            <p className="eyebrow">BUILT FOR REAL RESTAURANTS</p>
            <h2>One platform.<br /><span>Each restaurant's identity.</span></h2>
            <p className="approach__description">
              Restaurant names, branding, menus, prices, opening hours and contact details
              will be configured through data—not scattered through source code.
            </p>
          </div>
          <div className="approach-list">
            <div><span>01</span><p><strong>Reusable components</strong><small>Consistent UI without repeated code.</small></p><b>↗</b></div>
            <div><span>02</span><p><strong>Environment-based secrets</strong><small>Credentials stay out of source control.</small></p><b>↗</b></div>
            <div><span>03</span><p><strong>Structured database</strong><small>Versioned schema and migrations.</small></p><b>↗</b></div>
          </div>
        </Container>
      </section>

      <footer className="site-footer">
        <Container className="site-footer__inner">
          <a className="brand brand--footer" href="/"><span className="brand__mark">R</span><strong>Restaurant Platform</strong></a>
          <p>A thoughtful digital foundation for hospitality.</p>
          <span>Built for the next phase.</span>
        </Container>
      </footer>
    </main>
  );
}
