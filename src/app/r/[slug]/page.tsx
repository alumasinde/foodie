import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getPublishedRestaurantBySlug, normalizePhoneForWhatsApp, weekdayNames } from "@/lib/restaurant";
import type { CSSProperties } from "react";
import { OrderingReservations } from "@/components/restaurant/ordering-reservations";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getPublishedRestaurantBySlug(slug);
  if (!restaurant) return { title: "Restaurant not found" };
  return {
    title: restaurant.name,
    description: restaurant.description ?? restaurant.tagline ?? `Visit ${restaurant.name}`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description ?? restaurant.tagline ?? `Visit ${restaurant.name}`,
      images: restaurant.heroImageUrl ? [restaurant.heroImageUrl] : undefined,
    },
  };
}

export default async function RestaurantPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getPublishedRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const theme = {
    "--restaurant-primary": restaurant.primaryColor,
    "--restaurant-accent": restaurant.accentColor,
  } as CSSProperties;
  const whatsapp = normalizePhoneForWhatsApp(restaurant.whatsappNumber);
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello ${restaurant.name}, I'd like to make an enquiry.`)}`
    : null;

  const menuCategories = restaurant.menuCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    items: category.items
      .filter((item) => item.restaurantId === restaurant.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        categoryId: item.categoryId,
      })),
  }));

  return (
    <main className="restaurant-site" style={theme}>
      <header className="restaurant-header">
        <Container className="restaurant-header__inner">
          <a className="restaurant-brand" href={`/r/${restaurant.slug}`}>
            {restaurant.logoUrl ? (
              // Restaurant logos are configurable URLs. Use an ordinary img to avoid requiring per-tenant remotePatterns.
              <img className="restaurant-brand__logo" src={restaurant.logoUrl} alt={`${restaurant.name} logo`} />
            ) : <span className="restaurant-brand__fallback">{restaurant.name.slice(0, 1).toUpperCase()}</span>}
            <span><strong>{restaurant.name}</strong>{restaurant.tagline ? <small>{restaurant.tagline}</small> : null}</span>
          </a>
          <nav className="restaurant-nav" aria-label="Restaurant navigation">
            <a href="#menu">Menu</a><a href="#about">About</a><a href="#hours">Hours</a><a href="#order">Order</a><a href="#reserve">Reserve</a><a href="#contact">Contact</a>
          </nav>
          {whatsappUrl ? <a className="restaurant-header__cta" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp <span aria-hidden="true">↗</span></a> : null}
        </Container>
      </header>

      <section className={`restaurant-hero${restaurant.heroImageUrl ? " restaurant-hero--image" : ""}`} style={restaurant.heroImageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(9,25,29,.82), rgba(9,25,29,.28)), url("${restaurant.heroImageUrl.replace(/"/g, "%22")}")` } : undefined}>
        <Container className="restaurant-hero__inner">
          <p className="restaurant-eyebrow">{restaurant.tagline ?? "WELCOME · GOOD FOOD, GOOD COMPANY"}</p>
          <h1>{restaurant.heroTitle ?? restaurant.name}</h1>
          <p className="restaurant-hero__description">{restaurant.heroSubtitle ?? restaurant.description ?? "Discover our restaurant, explore what we offer, and get in touch."}</p>
          <div className="restaurant-hero__actions">
            <a className="restaurant-button restaurant-button--accent" href="#menu">View menu <span aria-hidden="true">↓</span></a>
            {whatsappUrl ? <a className="restaurant-button restaurant-button--accent" href={whatsappUrl} target="_blank" rel="noreferrer">Chat with us <span aria-hidden="true">↗</span></a> : null}
            {restaurant.googleMapsUrl ? <a className="restaurant-button restaurant-button--outline" href={restaurant.googleMapsUrl} target="_blank" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a> : null}
          </div>
        </Container>
        {restaurant.heroImageUrl ? <span className="restaurant-hero__image-credit">Welcome to {restaurant.name}</span> : null}
      </section>

      <Container>
        <OrderingReservations
          slug={restaurant.slug}
          restaurantName={restaurant.name}
          currency={restaurant.currency || "KES"}
          whatsappUrl={whatsappUrl}
          categories={menuCategories}
          diningAreas={restaurant.diningAreas.map((area) => ({ id: area.id, name: area.name, description: area.description, capacity: area.capacity }))}
        />
      </Container>

      <section className="restaurant-info" id="about">
        <Container className="restaurant-info__grid">
          <article className="restaurant-info-card">
            <span className="restaurant-info-card__icon" aria-hidden="true">⌖</span>
            <div><h2>Find us</h2><p>{restaurant.locationName ?? restaurant.address ?? "Location details coming soon"}</p>{restaurant.address && restaurant.locationName ? <small>{restaurant.address}</small> : null}{restaurant.googleMapsUrl ? <a href={restaurant.googleMapsUrl} target="_blank" rel="noreferrer">Open map ↗</a> : null}</div>
          </article>
          <article className="restaurant-info-card" id="contact">
            <span className="restaurant-info-card__icon" aria-hidden="true">✆</span>
            <div><h2>Get in touch</h2>{restaurant.phone ? <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a> : <p>Phone details coming soon</p>}{restaurant.email ? <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> : null}{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer">Message on WhatsApp ↗</a> : null}</div>
          </article>
        </Container>
      </section>

      <section className="restaurant-hours" id="hours">
        <Container className="restaurant-hours__inner">
          <div><p className="restaurant-eyebrow">PLAN YOUR VISIT</p><h2>Opening hours</h2><p className="restaurant-hours__intro">We look forward to welcoming you.</p></div>
          <div className="hours-list">
            {weekdayNames.map((day, index) => {
              const hours = restaurant.openingHours.find((entry) => entry.dayOfWeek === index);
              return <div className="hours-list__row" key={day}><span>{day}</span><strong>{!hours ? "Hours not set" : hours.isClosed ? "Closed" : `${hours.opensAt ?? "—"} – ${hours.closesAt ?? "—"}`}</strong></div>;
            })}
          </div>
        </Container>
      </section>

      <footer className="restaurant-footer">
        <Container className="restaurant-footer__inner">
          <div><strong>{restaurant.name}</strong><p>{restaurant.tagline ?? "Thank you for visiting."}</p></div>
          <span>{restaurant.address ?? restaurant.locationName ?? ""}</span>
          {restaurant.websiteUrl ? <a href={restaurant.websiteUrl} target="_blank" rel="noreferrer">Official website ↗</a> : null}
        </Container>
      </footer>
      {whatsappUrl ? <a className="restaurant-whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={`Chat with ${restaurant.name} on WhatsApp`}>WhatsApp <span aria-hidden="true">↗</span></a> : null}
    </main>
  );
}
