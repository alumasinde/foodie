"use client";

import { useMemo, useState } from "react";
import { QuickMenu } from "@/components/restaurant/quick-menu";

type MenuItem = { id: string; name: string; description: string | null; price: string; imageUrl: string | null; isAvailable: boolean; isFeatured: boolean; categoryId: string };
type MenuCategory = { id: string; name: string; slug: string; items: MenuItem[] };
type DiningArea = { id: string; name: string; description: string | null; capacity: number | null };
type Props = { slug: string; restaurantName: string; currency: string; whatsappUrl: string | null; categories: MenuCategory[]; diningAreas: DiningArea[] };
type CartLine = { item: MenuItem; quantity: number };

function money(value: number, currency: string) {
  if (currency === "KES") return `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: value % 1 ? 2 : 0 }).format(value)}`;
  return new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
}

export function OrderingReservations(props: Props) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderForm, setOrderForm] = useState({ customerName: "", customerPhone: "", orderType: "pickup", deliveryAddress: "", notes: "" });
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [statusReference, setStatusReference] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [reservation, setReservation] = useState({ customerName: "", customerPhone: "", guestCount: "2", reservationDate: "", diningAreaId: "", notes: "" });
  const [reservationBusy, setReservationBusy] = useState(false);
  const [reservationMessage, setReservationMessage] = useState("");
  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0), [cart]);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((current) => current.some((line) => line.item.id === item.id)
      ? current.map((line) => line.item.id === item.id ? { ...line, quantity: Math.min(50, line.quantity + 1) } : line)
      : [...current, { item, quantity: 1 }]);
    setOrderMessage("");
  }
  function setQuantity(id: string, quantity: number) {
    setCart((current) => quantity < 1 ? current.filter((line) => line.item.id !== id) : current.map((line) => line.item.id === id ? { ...line, quantity: Math.min(50, quantity) } : line));
  }
  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setOrderBusy(true); setOrderMessage(""); setOrderReference("");
    try {
      const response = await fetch(`/api/r/${encodeURIComponent(props.slug)}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...orderForm, items: cart.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit your order.");
      setOrderReference(data.order.reference); setOrderMessage(`Order received. Your reference is ${data.order.reference}. The restaurant will confirm your order shortly.`); setCart([]);
      if (props.whatsappUrl) {
        const text = `Hello ${props.restaurantName}, I have submitted order ${data.order.reference}.\nName: ${orderForm.customerName}\nPhone: ${orderForm.customerPhone}\nType: ${orderForm.orderType}\nTotal: ${money(Number(data.order.subtotal), props.currency)}\nPlease confirm. `;
        window.open(`${props.whatsappUrl.split("?")[0]}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) { setOrderMessage(error instanceof Error ? error.message : "Could not submit your order."); }
    finally { setOrderBusy(false); }
  }
  async function checkOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatusBusy(true); setStatusMessage("");
    try {
      const response = await fetch(`/api/r/${encodeURIComponent(props.slug)}/orders/${encodeURIComponent(statusReference.trim())}`);
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Order not found.");
      const labels: Record<string, string> = { received: "Received — awaiting restaurant confirmation", confirmed: "Confirmed by the restaurant", preparing: "Being prepared", ready: "Ready for collection / service", completed: "Completed", cancelled: "Cancelled" };
      setStatusMessage(`Order ${data.order.reference}: ${labels[data.order.status] ?? data.order.status}. Total: ${money(Number(data.order.subtotal), props.currency)}.`);
    } catch (error) { setStatusMessage(error instanceof Error ? error.message : "Unable to check order."); }
    finally { setStatusBusy(false); }
  }
  async function submitReservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setReservationBusy(true); setReservationMessage("");
    try {
      const response = await fetch(`/api/r/${encodeURIComponent(props.slug)}/reservations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...reservation, guestCount: Number(reservation.guestCount), reservationDate: new Date(reservation.reservationDate).toISOString(), diningAreaId: reservation.diningAreaId || null }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not request a reservation.");
      const when = new Date(data.reservation.reservationDate).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
      setReservationMessage(`Reservation request received. Reference: ${data.reservation.reference}. Requested for ${when}. The restaurant will contact you to confirm.`);
      if (props.whatsappUrl) {
        const text = `Hello ${props.restaurantName}, I have requested reservation ${data.reservation.reference}.\nName: ${reservation.customerName}\nPhone: ${reservation.customerPhone}\nGuests: ${reservation.guestCount}\nDate/time: ${when}\nDining area: ${props.diningAreas.find((area) => area.id === reservation.diningAreaId)?.name ?? "Any available area"}. Please confirm.`;
        window.open(`${props.whatsappUrl.split("?")[0]}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) { setReservationMessage(error instanceof Error ? error.message : "Could not request a reservation."); }
    finally { setReservationBusy(false); }
  }

  return <>
    <QuickMenu currency={props.currency} categories={props.categories} onAddToCart={addToCart} />
    <section className="commerce-section" id="order" aria-labelledby="order-title">
      <div className="commerce-heading"><p className="restaurant-eyebrow">ORDER ONLINE</p><h2 id="order-title">Your order, your way.</h2><p>Add your favourites to the cart and send your order directly to the restaurant.</p></div>
      <div className="commerce-grid">
        <div className="commerce-card cart-card"><div className="commerce-card-heading"><h3>Your cart</h3><span>{cartCount} {cartCount === 1 ? "item" : "items"}</span></div>
          {cart.length ? <div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.item.id}><div><strong>{line.item.name}</strong><small>{money(Number(line.item.price), props.currency)} each</small></div><div className="quantity-control"><button type="button" onClick={() => setQuantity(line.item.id, line.quantity - 1)} aria-label={`Remove one ${line.item.name}`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => setQuantity(line.item.id, line.quantity + 1)} aria-label={`Add one ${line.item.name}`}>＋</button></div><strong>{money(Number(line.item.price) * line.quantity, props.currency)}</strong></div>)}<div className="cart-subtotal"><span>Subtotal</span><strong>{money(subtotal, props.currency)}</strong></div></div> : <div className="cart-empty"><span aria-hidden="true">＋</span><strong>Your cart is empty</strong><p>Choose items from the menu above to get started.</p></div>}
          <p className="commerce-footnote">Delivery fees, if applicable, are confirmed by the restaurant. No online payment is collected.</p>
        </div>
        <form className="commerce-card commerce-form" onSubmit={submitOrder}><div className="commerce-card-heading"><h3>Checkout details</h3><span>Quick and simple</span></div>
          <label>Full name<input required minLength={2} maxLength={120} value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} autoComplete="name" /></label>
          <label>Phone number<input required minLength={7} maxLength={30} type="tel" value={orderForm.customerPhone} onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })} autoComplete="tel" placeholder="e.g. 07xx xxx xxx" /></label>
          <label>Order type<select value={orderForm.orderType} onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}><option value="pickup">Pickup / takeaway</option><option value="delivery">Delivery</option><option value="dine_in">Dine in</option></select></label>
          {orderForm.orderType === "delivery" ? <label>Delivery address<input required minLength={5} maxLength={500} value={orderForm.deliveryAddress} onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} placeholder="Estate, building, nearby landmark" /></label> : null}
          <label>Notes (optional)<textarea maxLength={500} rows={3} value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} placeholder="Allergies, directions or special requests" /></label>
          {orderMessage ? <p className={`form-feedback${orderReference ? " form-feedback--success" : ""}`} role="status">{orderMessage}</p> : null}
          <button className="commerce-submit" type="submit" disabled={!cart.length || orderBusy}>{orderBusy ? "Submitting…" : `Place order · ${money(subtotal, props.currency)}`}</button>
          <p className="commerce-footnote">Submitting creates an order request, not an instant confirmation. The restaurant will confirm availability and any delivery charges.</p>
        </form>
      </div>
      <form className="order-status-form" onSubmit={checkOrder}><div><strong>Already placed an order?</strong><p>Enter your order reference to check its latest status.</p></div><input required value={statusReference} onChange={(e) => setStatusReference(e.target.value)} placeholder="e.g. FD-A1B2C3D4" aria-label="Order reference" /><button type="submit" disabled={statusBusy}>{statusBusy ? "Checking…" : "Check status"}</button>{statusMessage ? <p role="status" className="status-feedback">{statusMessage}</p> : null}</form>
    </section>

    <section className="commerce-section reservation-section" id="reserve" aria-labelledby="reserve-title">
      <div className="commerce-heading"><p className="restaurant-eyebrow">SAVE YOUR SEAT</p><h2 id="reserve-title">Make time for a good meal.</h2><p>Request a table in a few steps. Your booking is confirmed once the restaurant contacts you.</p></div>
      <div className="reservation-layout"><div className="reservation-note"><span aria-hidden="true">✦</span><h3>Good food tastes better together.</h3><p>Tell us when you would like to visit, how many guests are joining, and your preferred dining area.</p><ul><li>No deposit or payment required online</li><li>Requests are reviewed by the restaurant</li><li>We’ll contact you to confirm your table</li></ul></div>
        <form className="commerce-card commerce-form" onSubmit={submitReservation}><div className="commerce-card-heading"><h3>Reservation request</h3><span>Table booking</span></div>
          <label>Full name<input required minLength={2} maxLength={120} value={reservation.customerName} onChange={(e) => setReservation({ ...reservation, customerName: e.target.value })} autoComplete="name" /></label>
          <label>Phone number<input required minLength={7} maxLength={30} type="tel" value={reservation.customerPhone} onChange={(e) => setReservation({ ...reservation, customerPhone: e.target.value })} autoComplete="tel" placeholder="e.g. 07xx xxx xxx" /></label>
          <div className="form-two-columns"><label>Guests<select value={reservation.guestCount} onChange={(e) => setReservation({ ...reservation, guestCount: e.target.value })}>{Array.from({ length: 30 }, (_, i) => i + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></label><label>Date and time<input type="datetime-local" required min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)} value={reservation.reservationDate} onChange={(e) => setReservation({ ...reservation, reservationDate: e.target.value })} /></label></div>
          <label>Preferred dining area<select value={reservation.diningAreaId} onChange={(e) => setReservation({ ...reservation, diningAreaId: e.target.value })}><option value="">Any available area</option>{props.diningAreas.map((area) => <option value={area.id} key={area.id}>{area.name}{area.capacity ? ` · up to ${area.capacity} guests` : ""}</option>)}</select></label>
          {props.diningAreas.find((area) => area.id === reservation.diningAreaId)?.description ? <p className="area-description">{props.diningAreas.find((area) => area.id === reservation.diningAreaId)?.description}</p> : null}
          <label>Special requests (optional)<textarea rows={3} maxLength={500} value={reservation.notes} onChange={(e) => setReservation({ ...reservation, notes: e.target.value })} placeholder="Birthday, accessibility needs, seating preferences…" /></label>
          {reservationMessage ? <p className="form-feedback form-feedback--success" role="status">{reservationMessage}</p> : null}
          <button className="commerce-submit" type="submit" disabled={reservationBusy}>{reservationBusy ? "Sending request…" : "Request a table"}</button>
        </form>
      </div>
    </section>
  </>;
}
