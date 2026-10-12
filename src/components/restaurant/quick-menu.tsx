"use client";

import { useMemo, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
};

type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
};

type QuickMenuProps = {
  currency: string;
  categories: MenuCategory[];
  onAddToCart: (item: MenuItem) => void;
};

function formatPrice(price: string, currency: string): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Price unavailable";
  if (currency === "KES") {
    return `KSh ${new Intl.NumberFormat("en-KE", {
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)}`;
  }
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function QuickMenu({
  currency,
  categories,
  onAddToCart,
}: QuickMenuProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const allItems = useMemo(() => categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryName: category.name })),
  ), [categories]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return allItems.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch = !term ||
        item.name.toLocaleLowerCase().includes(term) ||
        (item.description ?? "").toLocaleLowerCase().includes(term) ||
        item.categoryName.toLocaleLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, allItems, search]);

  const featuredItems = allItems.filter((item) => item.isFeatured && item.isAvailable);
  const visibleItems = filteredItems;

  return (
    <section className="quick-menu" id="menu" aria-labelledby="quick-menu-title">
      <div className="quick-menu__intro">
        <p className="restaurant-eyebrow">MADE FRESH, SERVED WITH CARE</p>
        <h2 id="quick-menu-title">A menu worth coming back for.</h2>
        <p>Explore the menu, check prices, and find something you’ll love.</p>
      </div>

      {featuredItems.length > 0 ? (
        <div className="quick-menu__featured">
          <div className="quick-menu__featured-heading">
            <div>
              <span className="quick-menu__kicker">CUSTOMER FAVOURITES</span>
              <h3>Popular right now</h3>
            </div>
          </div>
          <div className="quick-menu__featured-grid">
            {featuredItems.slice(0, 3).map((item) => (
              <article className="featured-meal" key={item.id}>
                {item.imageUrl ? (
                  // Image URLs are managed as restaurant menu content.
                  <img className="featured-meal__image" src={item.imageUrl} alt={item.name} loading="lazy" />
                ) : (
                  <div className="featured-meal__placeholder" aria-hidden="true"><span>✦</span></div>
                )}
                <div className="featured-meal__body">
                  <div className="featured-meal__title-row">
                    <h4>{item.name}</h4>
                    <strong>{formatPrice(item.price, currency)}</strong>
                  </div>
                  {item.description ? <p>{item.description}</p> : null}
                  <span className="featured-meal__category">{item.categoryName}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="quick-menu__toolbar">
        <div className="quick-menu__toolbar-copy">
          <span className="quick-menu__kicker">THE MENU</span>
          <h3>Find your next favourite</h3>
        </div>
        <label className="menu-search">
          <span className="menu-search__icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search menu</span>
          <input
            type="search"
            placeholder="Search meals..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search ? (
            <button type="button" className="menu-search__clear" onClick={() => setSearch("")} aria-label="Clear search">×</button>
          ) : null}
        </label>
      </div>

      <div className="menu-categories" aria-label="Filter menu by category">
        <button
          type="button"
          className={`menu-category${activeCategory === "all" ? " is-active" : ""}`}
          aria-pressed={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          All menu
        </button>
        {categories.map((category) => (
          <button
            type="button"
            className={`menu-category${activeCategory === category.id ? " is-active" : ""}`}
            aria-pressed={activeCategory === category.id}
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {visibleItems.length > 0 ? (
        <div className="menu-grid">
          {visibleItems.map((item) => (
            <article className={`menu-card${item.isAvailable ? "" : " menu-card--unavailable"}`} key={item.id}>
              <div className="menu-card__media">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} loading="lazy" />
                ) : (
                  <div className="menu-card__placeholder" aria-hidden="true">
                    <span className="menu-card__placeholder-mark">✦</span>
                    <span>{item.categoryName}</span>
                  </div>
                )}
                {item.isFeatured && item.isAvailable ? <span className="menu-card__badge">Popular</span> : null}
                {!item.isAvailable ? <span className="menu-card__sold-out">Currently unavailable</span> : null}
              </div>
              <div className="menu-card__body">
                <div className="menu-card__meta"><span>{item.categoryName}</span><span className={item.isAvailable ? "availability availability--yes" : "availability availability--no"}><i />{item.isAvailable ? "Available" : "Sold out"}</span></div>
                <h4>{item.name}</h4>
                {item.description ? <p className="menu-card__description">{item.description}</p> : <p className="menu-card__description menu-card__description--empty">Prepared fresh for you.</p>}
                <div className="menu-card__footer">
                  <strong>{formatPrice(item.price, currency)}</strong>
                  {item.isAvailable ? (
                    <button type="button" className="menu-card__order" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name} to cart`}>
                      Add to order <span aria-hidden="true">＋</span>
                    </button>
                  ) : (
                    <span className="menu-card__order menu-card__order--disabled">Unavailable</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="menu-empty">
          <span className="menu-empty__icon" aria-hidden="true">⌕</span>
          <h4>{categories.length === 0 ? "Our menu is coming soon" : "No meals found"}</h4>
          <p>{categories.length === 0 ? "Please check back soon for the latest menu and prices." : "Try another search or choose a different category."}</p>
          {search || activeCategory !== "all" ? (
            <button type="button" className="menu-empty__reset" onClick={() => { setSearch(""); setActiveCategory("all"); }}>
              Clear filters
            </button>
          ) : null}
        </div>
      )}
      <p className="quick-menu__note">Prices are shown in {currency}. Please contact the restaurant to confirm availability before travelling.</p>
    </section>
  );
}
