import { useState } from "react";
import searchHome from "../assets/reference/search-home.png";
import { title } from "../data/listing";
import { Icon } from "./Icon";

export function SiteHeader({ decorative = false }: { decorative?: boolean }) {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="#listing"
        tabIndex={decorative ? -1 : undefined}
        aria-label="Airbnb home"
      >
        <svg
          viewBox="0 0 30 34"
          width="30"
          height="34"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M15 2C10 2 8 10 3 22-3 36 11 34 18 23c7-11-8-14-7-5 1 10 21 21 17 6C23 12 20 2 15 2Z" />
        </svg>
        <span>airbnb</span>
      </a>
      <div className="search-pill">
        <span
          className="search-home"
          data-reference-symbol="🏡"
          aria-hidden="true"
        >
          <img src={searchHome} alt="" />
        </span>
        <button disabled={decorative}>Anywhere</button>
        <span />
        <button disabled={decorative}>Anytime</button>
        <span />
        <button disabled={decorative} className="muted">
          Add guests
        </button>
        <button
          disabled={decorative}
          className="search-button"
          aria-label="Search"
        >
          <Icon name="search" size={16} />
        </button>
      </div>
      <div className="header-actions">
        <button disabled={decorative}>Become a host</button>
        <button
          disabled={decorative}
          className="round pale"
          aria-label="Language and currency"
        >
          <Icon name="globe" size={18} />
        </button>
        <button disabled={decorative} className="round pale" aria-label="Menu">
          <Icon name="menu" size={18} />
        </button>
      </div>
    </header>
  );
}
export function TitleBar({ decorative = false }: { decorative?: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="title-bar page-width">
      <h1>{title}</h1>
      <div className="title-actions">
        <button disabled={decorative} className="text-button">
          <Icon name="share" size={17} /> <u>Share</u>
        </button>
        <button
          disabled={decorative}
          className="text-button"
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        >
          <Icon
            name="heart"
            size={18}
            style={saved ? { fill: "#ff385c", color: "#ff385c" } : undefined}
          />{" "}
          <u>{saved ? "Saved" : "Save"}</u>
        </button>
      </div>
    </div>
  );
}
