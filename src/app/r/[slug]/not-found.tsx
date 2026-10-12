import { Container } from "@/components/ui/container";

export default function RestaurantNotFound() {
  return <main className="restaurant-site"><section className="restaurant-hero"><Container className="restaurant-hero__inner"><p className="restaurant-eyebrow">PAGE NOT AVAILABLE</p><h1>This restaurant page could not be found.</h1><p className="restaurant-hero__description">The link may be incorrect, or this restaurant website is not published yet.</p><a className="restaurant-button restaurant-button--accent" href="/">Return to home</a></Container></section></main>;
}
