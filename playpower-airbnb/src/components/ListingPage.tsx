import { useEffect, useRef, useState } from "react";
import { asset, galleryAsset, heroIds, photoById } from "../data/photos";
import { dateFromKey, formatStayDate, initialStay } from "../data/stayDates";
import type { DateField, StayDates } from "../data/stayDates";
import {
  amenities,
  amenityGroups,
  features,
  nearby,
  reviews,
} from "../data/listing";
import { Icon, Laurel } from "./Icon";
import { Calendar } from "./Calendar";

type Props = { onOpenTour: (photoId?: string) => void };
type ListingSection = "photos" | "amenities" | "reviews" | "location";

function StickySectionNav({
  visible,
  active,
  onNavigate,
  onReserve,
}: {
  visible: boolean;
  active: ListingSection;
  onNavigate: (section: ListingSection) => void;
  onReserve: () => void;
}) {
  return (
    <header
      className={`sticky-section-bar ${visible ? "visible" : ""}`}
      aria-hidden={visible ? undefined : true}
      inert={!visible}
    >
      <div className="sticky-section-inner">
        <nav aria-label="Listing sections">
          {(["photos", "amenities", "reviews", "location"] as const).map(
            (section) => (
              <button
                key={section}
                className={active === section ? "active" : ""}
                aria-current={active === section ? "location" : undefined}
                onClick={() => onNavigate(section)}
              >
                {section[0].toUpperCase() + section.slice(1)}
              </button>
            ),
          )}
        </nav>
        <div className="sticky-booking">
          <p>
            <strong>₹28,499</strong> for 5 nights
            <span>★ 4.95 · 19 reviews</span>
          </p>
          <button className="reserve" onClick={onReserve}>Reserve</button>
        </div>
      </div>
    </header>
  );
}

function OutlineButton({ children }: { children: React.ReactNode }) {
  return <button className="outline-button">{children}</button>;
}

function AmenitiesDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="amenities-dialog"
      aria-labelledby="amenities-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="amenities-dialog-shell">
        <button
          className="amenities-close round"
          aria-label="Close amenities"
          onClick={onClose}
        >
          <Icon name="close" size={22} />
        </button>
        <div className="amenities-dialog-scroll">
          <h2 id="amenities-dialog-title">What this place offers</h2>
          {amenityGroups.map((group) => (
            <section className="amenity-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map(([icon, label]) => (
                  <li key={label}>
                    <Icon name={icon} size={28} />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}

function BookingCard({
  stay,
  onChooseDate,
}: {
  stay: StayDates;
  onChooseDate: (field: DateField) => void;
}) {
  return (
    <aside className="booking-column" aria-label="Stay details">
      <div className="offer">
        <span aria-hidden="true">🏷️</span>
        <p>
          Get 10% off your next stay.
          <br />
          <u>Terms apply</u>
        </p>
        <button>Claim</button>
      </div>
      <div className="booking-card">
        <div className="price">
          <strong>
            <u>₹28,499</u>
          </strong>{" "}
          for 5 nights
        </div>
        <div className="booking-fields">
          <button
            className="booking-date"
            aria-label="Choose check-in date"
            onClick={() => onChooseDate("checkin")}
          >
            <b>CHECK-IN</b>
            <span>
              {stay.checkIn ? formatStayDate(stay.checkIn, true) : "Add date"}
            </span>
          </button>
          <button
            className="booking-date"
            aria-label="Choose checkout date"
            onClick={() => onChooseDate("checkout")}
          >
            <b>CHECKOUT</b>
            <span>
              {stay.checkOut ? formatStayDate(stay.checkOut, true) : "Add date"}
            </span>
          </button>
          <label>
            <b>GUESTS</b>
            <select aria-label="Number of guests" defaultValue="2">
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
            </select>
          </label>
        </div>
        <p className="cancellation">
          Free cancellation before <strong>17 October</strong>
        </p>
        <button className="reserve" onClick={() => onChooseDate("checkin")}>
          Reserve
        </button>
        <p className="no-charge">You won't be charged yet</p>
      </div>
      <button className="report">
        <Icon name="flag" size={16} />
        <u>Report this listing</u>
      </button>
    </aside>
  );
}

function Reviews() {
  const categories = [
    ["Cleanliness", "5.0", "clean"],
    ["Accuracy", "5.0", "check"],
    ["Check-in", "5.0", "key"],
    ["Communication", "5.0", "chat"],
    ["Location", "4.8", "map"],
    ["Value", "4.8", "tag"],
  ];
  return (
    <section id="reviews" className="reviews-section" aria-labelledby="reviews-heading">
      <div className="rating-feature">
        <div className="rating-number">
          <Laurel className="laurel-art left" />
          4.95
          <Laurel className="laurel-art right" />
        </div>
        <h2 id="reviews-heading">Guest favourite</h2>
        <p>
          This home is a guest favourite based on ratings, reviews and
          <br /> reliability
        </p>
        <button className="underlined">How reviews work</button>
      </div>
      <div className="rating-categories">
        <div className="overall">
          <span>Overall rating</span>
          {[5, 4, 3, 2, 1].map((number, i) => (
            <div key={number}>
              <small>{number}</small>
              <i>
                <em style={{ width: i === 0 ? "95%" : i === 1 ? "5%" : 0 }} />
              </i>
            </div>
          ))}
        </div>
        {categories.map(([name, value, icon]) => (
          <div className="rating-category" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
            <Icon name={icon} size={32} />
          </div>
        ))}
      </div>
      <div
        className="review-chips"
        role="region"
        aria-label="Review highlights"
        tabIndex={0}
      >
        {[
          ["🛋️", "Comfort", "6"],
          ["✅", "Accuracy", "5"],
          ["🛁", "Hot tub", "5"],
          ["🪣", "Condition", "4"],
          ["🎁", "Hospitality", "8"],
          ["🧴", "Cleanliness", "4"],
          ["🧺", "Amenities", "2"],
          ["🖼️", "Interior", "4"],
        ].map(([emoji, name, count]) => (
          <span key={name}>
            {emoji} &nbsp;{name} <span className="muted">{count}</span>
          </span>
        ))}
      </div>
      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review" key={review.name}>
            <div className="review-person">
              {"image" in review && review.image ? (
                <img src={asset(review.image)} alt="" loading="lazy" />
              ) : (
                <span
                  className={`avatar ${review.initial === "V" ? "lavender" : ""}`}
                >
                  {review.initial}
                </span>
              )}
              <div>
                {review.name}
                <small>{review.tenure}</small>
              </div>
            </div>
            <p className="review-date">
              <span aria-label="5 out of 5 stars">★★★★★</span> · {review.when}
            </p>
            <p className="review-text">{review.text}</p>
            {review.more && <button className="underlined">Show more</button>}
          </article>
        ))}
      </div>
      <OutlineButton>Show all 19 reviews</OutlineButton>
    </section>
  );
}

function Location() {
  return (
    <section id="location" className="location-section">
      <h2>Where you’ll be</h2>
      <p>Candolim, Goa, India</p>
      <div
        className="map-illustration"
        role="img"
        aria-label="Illustrated approximate area in Candolim; exact location will be provided after booking"
      >
        <div className="map-water" />
        <span className="map-park one" />
        <span className="map-park two" />
        <span className="map-house">
          <Icon name="home" size={36} />
        </span>
        <span className="map-search">
          <Icon name="search" size={16} />
        </span>
        <div className="map-zoom">
          <span>+</span>
          <span>−</span>
        </div>
      </div>
      <p className="map-note">Exact location will be provided after booking.</p>
      <h3>Neighbourhood highlights</h3>
      <p className="neighbourhood">
        Located in the heart of Candolim, Amor de Goa offers a peaceful stay
        with easy access to beaches, cafes, and popular attractions.
      </p>
      <button className="underlined inline-icon">
        Show more <Icon name="next" size={18} />
      </button>
    </section>
  );
}

function Host() {
  return (
    <section className="host-section">
      <h2>Meet your host</h2>
      <div className="host-layout">
        <div>
          <div className="host-card">
            <div className="host-name">
              <img
                src={asset("host")}
                alt="Mirashya Homes logo"
                loading="lazy"
              />
              <strong>
                Mirashya
                <br />
                Homes
              </strong>
              <span>Host</span>
            </div>
            <div className="host-stats">
              <div>
                <b>1,463</b>
                <small>Reviews</small>
              </div>
              <div>
                <b>4.68★</b>
                <small>Rating</small>
              </div>
              <div>
                <b>2</b>
                <small>Years hosting</small>
              </div>
            </div>
          </div>
          <p className="host-fact">
            <Icon name="balloon" />
            Born in the 80s
          </p>
          <p className="host-fact">
            <Icon name="school" />
            Where I went to school: NICMAR GOA
          </p>
        </div>
        <div className="cohosts">
          <h3>Co-Hosts</h3>
          <div className="cohost-grid">
            {[
              "Sharath",
              "Aman Dev Pahwa",
              "Maria Karen Priyanka",
              "Simran",
              "Pallavi",
              "Sanyukta",
              "Shruti",
              "Amisha",
            ].map((name, i) => (
              <div key={name}>
                {i < 6 ? (
                  <img
                    className="cohost-avatar"
                    src={asset(
                      [
                        "cohost-sharath",
                        "cohost-aman",
                        "cohost-maria",
                        "cohost-simran",
                        "cohost-pallavi",
                        "cohost-sanyukta",
                      ][i],
                    )}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="avatar small-avatar lavender">
                    {name[0]}
                  </span>
                )}
                {name}
              </div>
            ))}
          </div>
          <h3>Host details</h3>
          <p>
            Response rate: 100%
            <br />
            Responds within an hour
          </p>
          <button className="pale-button">Message host</button>
          <p className="payment-note">
            <Icon name="shield" size={24} />
            To help protect your payment, always use Airbnb to send money and
            communicate with hosts.
          </p>
        </div>
      </div>
    </section>
  );
}

function PoliciesAndNearby() {
  return (
    <>
      <section className="policies">
        <h2>Things to know</h2>
        <div className="policy-grid">
          <article>
            <Icon name="calendar" />
            <h3>Cancellation policy</h3>
            <p>
              Free cancellation before 17 October. Cancel before check-in on 18
              October for a partial refund.
            </p>
            <p>Review this host’s full policy for details.</p>
            <button className="underlined">Learn more</button>
          </article>
          <article>
            <Icon name="key" />
            <h3>House rules</h3>
            <p>Check-in after 2:00 pm</p>
            <p>Checkout before 11:00 am</p>
            <p>3 guests maximum</p>
            <button className="underlined">Learn more</button>
          </article>
          <article>
            <Icon name="shield" />
            <h3>Safety & property</h3>
            <p>Carbon monoxide alarm not reported</p>
            <p>Smoke alarm not reported</p>
            <p>Exterior security cameras on property</p>
            <button className="underlined">Learn more</button>
          </article>
        </div>
      </section>
      <section className="nearby">
        <div className="section-title">
          <h2>More stays nearby</h2>
          <span className="muted">
            1 / 2 &nbsp; <span className="nearby-arrows">‹</span>{" "}
            <span className="nearby-arrows">›</span>
          </span>
        </div>
        <div className="nearby-grid">
          {nearby.map(([name, price, rating], i) => (
            <article key={name}>
              <img src={asset(`nearby-0${i + 1}`)} alt={name} loading="lazy" />
              <h3>{name}</h3>
              <p>
                {price} &nbsp;★ {rating}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function ListingPage({ onOpenTour }: Props) {
  const [stay, setStay] = useState<StayDates>(initialStay);
  const [dateField, setDateField] = useState<DateField>("checkin");
  const [monthOffset, setMonthOffset] = useState(9);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<ListingSection>("photos");
  const amenitiesOpenerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setStickyVisible(window.scrollY >= 620);
      const marker = window.scrollY + 104;
      const sectionPositions = (["amenities", "reviews", "location"] as const)
        .map((id) => ({ id, top: document.getElementById(id)?.offsetTop ?? Infinity }))
        .filter(({ top }) => Number.isFinite(top));
      let current: ListingSection = "photos";
      for (const section of sectionPositions) {
        if (marker >= section.top) current = section.id;
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  const closeAmenities = () => {
    setAmenitiesOpen(false);
    requestAnimationFrame(() =>
      amenitiesOpenerRef.current?.focus({ preventScroll: true }),
    );
  };
  const chooseDate = (key: string) => {
    if (dateField === "checkin" || !stay.checkIn || key <= stay.checkIn) {
      setStay({ checkIn: key, checkOut: null });
      setDateField("checkout");
    } else {
      setStay({ checkIn: stay.checkIn, checkOut: key });
      setDateField("checkin");
    }
  };
  const requestDate = (field: DateField) => {
    setDateField(field);
    const selected =
      field === "checkout" ? stay.checkOut ?? stay.checkIn : stay.checkIn;
    if (selected) {
      const date = dateFromKey(selected);
      setMonthOffset((date.getUTCFullYear() - 2026) * 12 + date.getUTCMonth());
    }
    document.getElementById("dates")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    document.getElementById("dates-heading")?.focus({ preventScroll: true });
  };
  const navigateToSection = (section: ListingSection) => {
    document.getElementById(section)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  };
  return (
    <main id="listing" className="page-width listing-page">
      <StickySectionNav
        visible={stickyVisible}
        active={activeSection}
        onNavigate={navigateToSection}
        onReserve={() => requestDate("checkin")}
      />
      <div id="photos" className="hero-grid">
        {heroIds.map((id, index) => (
          <button
            className={`hero-tile hero-${index}`}
            key={id}
            aria-label={`Open photo tour: ${photoById(id).alt}`}
            onClick={() => onOpenTour(id)}
          >
            <img
              src={galleryAsset(id)}
              alt={photoById(id).alt}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          </button>
        ))}
        <button className="show-photos" onClick={() => onOpenTour()}>
          <Icon name="grid" size={17} />
          Show all photos
        </button>
      </div>
      <div className="listing-details">
        <div className="details-left">
          <section className="intro">
            <h2>Entire serviced apartment in Candolim, India</h2>
            <p>3 guests · 1 bedroom · 1 bed · 1 bathroom</p>
            <div className="guest-badge">
              <strong className="guest-label">
                <Laurel className="badge-laurel" /> Guest
                <br /> favourite <Laurel className="badge-laurel" />
              </strong>
              <span className="guest-summary">
                One of the most loved homes on Airbnb,
                <br /> according to guests
              </span>
              <strong className="guest-rating">
                4.95<small>★★★★★</small>
              </strong>
              <span className="review-count">
                <b>19</b>
                <small>Reviews</small>
              </span>
            </div>
            <div className="host-summary">
              <img src={asset("host")} alt="" />
              <p>
                <strong>Hosted by Mirashya Homes</strong>
                <span>2 years hosting</span>
              </p>
            </div>
          </section>
          <section className="features">
            {features.map(([icon, name, text]) => (
              <div className="feature" key={name}>
                <Icon name={icon} />
                <div>
                  <strong>{name}</strong>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </section>
          <section className="description">
            <p className="translation">
              Some info has been automatically translated.{" "}
              <button className="underlined">Show original</button>
            </p>
            <p
              className={`description-copy ${descriptionExpanded ? "expanded" : ""}`}
              id="listing-description"
            >
              🌴 Plan Your Relaxing Holiday at Amor De Goa by Mirashya Homes! ✨
              Stay in this cozy 1BHK in the heart of Candolim, featuring a
              private jacuzzi 🛁 for the perfect unwind. Enjoy high-speed WiFi
              💻, Smart TV 📺, pet-friendly comfort 🐾, and stylish interiors.
              Just minutes from Candolim Beach 🏖️, popular cafés, restaurants,
              and nightlife 🍹, it’s ideal for couples seeking romance,
              relaxation, and a touch of luxury in North Goa. 💗 🌴
            </p>
            <button
              className="underlined inline-icon"
              aria-expanded={descriptionExpanded}
              aria-controls="listing-description"
              onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            >
              {descriptionExpanded ? "Show less" : "Show more"}
              <Icon name="next" size={18} />
            </button>
          </section>
          <section className="sleep-section">
            <h2>Where you'll sleep</h2>
            <div className="sleep-grid">
              {[
                ["bedroom", "Bedroom", "1 double bed"],
                ["living-01", "Living room", "1 sofa"],
              ].map(([id, label, detail]) => (
                <div key={id}>
                  <button
                    className="sleep-image"
                    aria-label={`Open photo tour: ${label}`}
                    onClick={() => onOpenTour(id)}
                  >
                    <img
                      src={galleryAsset(id)}
                      alt={photoById(id).alt}
                      loading="lazy"
                    />
                  </button>
                  <strong>{label}</strong>
                  <p className="muted">{detail}</p>
                </div>
              ))}
            </div>
          </section>
          <section id="amenities" className="amenities">
            <h2>What this place offers</h2>
            <div className="amenity-grid">
              {amenities.map(([icon, label], index) => (
                <div className={index > 7 ? "missing-amenity" : ""} key={label}>
                  <Icon name={icon} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <button
              ref={amenitiesOpenerRef}
              className="outline-button"
              onClick={() => setAmenitiesOpen(true)}
            >
              Show all 50 amenities
            </button>
          </section>
          <Calendar
            stay={stay}
            offset={monthOffset}
            onMonthChange={setMonthOffset}
            onSelect={chooseDate}
            onClear={() => {
              setStay({ checkIn: null, checkOut: null });
              setDateField("checkin");
            }}
          />
        </div>
        <BookingCard stay={stay} onChooseDate={requestDate} />
      </div>
      <Reviews />
      <Location />
      <Host />
      <PoliciesAndNearby />
      {amenitiesOpen && (
        <AmenitiesDialog onClose={closeAmenities} />
      )}
    </main>
  );
}
