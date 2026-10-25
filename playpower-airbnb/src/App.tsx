import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ListingPage } from "./components/ListingPage";
import { SiteHeader, TitleBar } from "./components/SiteChrome";
import { Lightbox, PhotoTour } from "./components/PhotoViews";
import { photos } from "./data/photos";

type View =
  | { kind: "listing" }
  | { kind: "tour" }
  | { kind: "lightbox"; photoId: string };

function App() {
  const [view, setView] = useState<View>({ kind: "listing" });
  const tourRoot = useRef<HTMLDivElement>(null);
  const lightboxRoot = useRef<HTMLDivElement>(null);
  const listingOpener = useRef<HTMLElement | null>(null);
  const tourOpener = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<HTMLElement | null>(null);
  const overlayOpen = view.kind !== "listing";

  useLayoutEffect(() => {
    if (!overlayOpen) return;
    const position = window.scrollY;
    const original = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${position}px`,
      width: "100%",
      overflow: "hidden",
      paddingRight: `${scrollbar}px`,
    });
    return () => {
      Object.assign(document.body.style, original);
      window.scrollTo({ top: position, behavior: "instant" });
    };
  }, [overlayOpen]);

  useLayoutEffect(() => {
    const target =
      pendingFocus.current ??
      document.getElementById(
        view.kind === "tour"
          ? "tour-close"
          : view.kind === "lightbox"
            ? "lightbox-close"
            : "listing",
      );
    target?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [view.kind]);

  const closeLightbox = () => {
    pendingFocus.current = tourOpener.current;
    setView({ kind: "tour" });
  };
  const closeTour = () => {
    pendingFocus.current = listingOpener.current;
    setView({ kind: "listing" });
  };
  const navigate = (direction: number) =>
    setView((current) => {
      if (current.kind !== "lightbox") return current;
      const index = photos.findIndex((photo) => photo.id === current.photoId);
      return {
        kind: "lightbox",
        photoId:
          photos[Math.max(0, Math.min(photos.length - 1, index + direction))]
            .id,
      };
    });
  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (view.kind === "listing") return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (view.kind === "lightbox") closeLightbox();
      else closeTour();
    }
    if (
      view.kind === "lightbox" &&
      (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      event.preventDefault();
      navigate(event.key === "ArrowLeft" ? -1 : 1);
    }
    if (event.key === "Tab") {
      const root =
        view.kind === "tour" ? tourRoot.current : lightboxRoot.current;
      const targets = Array.from(
        root?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input,select,[tabindex="0"]',
        ) ?? [],
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0 &&
          !element.closest('[inert],[aria-hidden="true"]'),
      );
      const first = targets[0],
        last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };
  return (
    <div onKeyDown={handleKeys}>
      <div inert={overlayOpen} aria-hidden={overlayOpen || undefined}>
        <SiteHeader />
        <TitleBar />
        <ListingPage
          onOpenTour={() => {
            listingOpener.current = document.activeElement as HTMLElement;
            setView({ kind: "tour" });
          }}
        />
      </div>
      {overlayOpen && (
        <PhotoTour
          rootRef={tourRoot}
          hidden={view.kind === "lightbox"}
          onClose={closeTour}
          onOpen={(photoId) => {
            tourOpener.current = document.activeElement as HTMLElement;
            setView({ kind: "lightbox", photoId });
          }}
        />
      )}
      {view.kind === "lightbox" && (
        <Lightbox
          rootRef={lightboxRoot}
          photoId={view.photoId}
          onClose={closeLightbox}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
export default App;
