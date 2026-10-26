import { useEffect, useLayoutEffect } from "react";
import type { RefObject } from "react";
import { asset, galleryAsset, groups, photos } from "../data/photos";
import { Icon } from "./Icon";

export function PhotoTour({
  rootRef,
  hidden,
  onClose,
  onOpen,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  hidden: boolean;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const rowsFor = (groupId: string) => {
    const groupPhotos = photos.filter((photo) => photo.group === groupId);
    const rows: typeof groupPhotos[] = [];
    for (let index = 0; index < groupPhotos.length; ) {
      const photo = groupPhotos[index];
      if (photo.wide) {
        rows.push([photo]);
        index += 1;
      } else {
        rows.push(groupPhotos.slice(index, index + 2));
        index += 2;
      }
    }
    return rows;
  };
  return (
    <div
      className={`photo-tour ${hidden ? "covered" : ""}`}
      ref={rootRef}
      role="dialog"
      aria-modal={!hidden || undefined}
      aria-label="Photo tour"
      aria-hidden={hidden || undefined}
      inert={hidden}
    >
      <div className="tour-toolbar">
        <button
          id="tour-close"
          className="round"
          aria-label="Close photo tour"
          onClick={onClose}
        >
          <Icon name="back" size={20} />
        </button>
        <strong>Photo tour</strong>
        <div>
          <button className="round" aria-label="Share photos">
            <Icon name="share" size={20} />
          </button>
          <button className="round" aria-label="Save photos">
            <Icon name="heart" size={20} />
          </button>
        </div>
      </div>
      <div className="tour-scroll" data-testid="tour-scroll">
        <div className="tour-width">
          <nav className="category-nav" aria-label="Rooms and spaces">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() =>
                  document.getElementById(`group-${group.id}`)?.scrollIntoView({
                    block: "start",
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  })
                }
              >
                <img src={asset(group.thumbnail)} alt="" />
                <span>{group.title}</span>
              </button>
            ))}
          </nav>
          {groups.map((group) => (
            <section
              className="tour-group"
              id={`group-${group.id}`}
              key={group.id}
            >
              <div>
                <h2>{group.title}</h2>
                {group.details && <p>{group.details}</p>}
              </div>
              <div className="group-photos">
                {rowsFor(group.id).map((row, rowIndex) => (
                  <div
                    className={`photo-row ${row.length === 1 && row[0].wide ? "wide" : "pair"}`}
                    key={`${group.id}-row-${rowIndex}`}
                  >
                    {row.map((photo) => (
                    <button
                      key={photo.id}
                      id={`photo-${photo.id}`}
                      aria-label={`Open ${group.title} photo ${photos.filter((item) => item.group === group.id).indexOf(photo) + 1}`}
                      onClick={() => onOpen(photo.id)}
                    >
                      <img
                        src={galleryAsset(photo.id)}
                        alt={photo.alt}
                        loading={group.id === "living-1" ? "eager" : "lazy"}
                      />
                    </button>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Lightbox({
  rootRef,
  photoId,
  onClose,
  onNavigate,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  photoId: string;
  onClose: () => void;
  onNavigate: (direction: number) => void;
}) {
  const index = photos.findIndex((photo) => photo.id === photoId);
  const photo = photos[index];
  const group = groups.find((item) => item.id === photo.group)!;
  useEffect(() => {
    // Warm only immediate neighbours; never fetch the whole gallery at full resolution on open.
    for (const neighbour of [photos[index - 1], photos[index + 1]]) {
      if (!neighbour) continue;
      const image = new Image();
      image.src = galleryAsset(neighbour.id);
      image.decode().catch(() => {});
    }
  }, [index]);
  useLayoutEffect(() => {
    const active = document.activeElement;
    if (
      !rootRef.current?.contains(active) ||
      (active instanceof HTMLButtonElement && active.disabled)
    ) {
      document.getElementById("lightbox-close")?.focus({ preventScroll: true });
    }
  }, [photoId, rootRef]);
  return (
    <div
      ref={rootRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div className="lightbox-toolbar">
        <button
          className="round"
          aria-label="Return to photo tour"
          onClick={onClose}
        >
          <Icon name="grid" size={20} />
        </button>
        <strong id="lightbox-title">{group.title}</strong>
        <span
          className="lightbox-counter"
          aria-live="polite"
          aria-atomic="true"
        >
          {index + 1} of {photos.length}
        </span>
        <button
          id="lightbox-close"
          className="round"
          aria-label="Close lightbox"
          onClick={onClose}
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="lightbox-stage">
        <img src={galleryAsset(photo.id)} alt={photo.alt} decoding="async" />
      </div>
      <button
        className="lightbox-arrow previous"
        aria-label="Previous photo"
        disabled={index === 0}
        onClick={() => onNavigate(-1)}
      >
        <Icon name="back" size={24} />
      </button>
      <button
        className="lightbox-arrow next"
        aria-label="Next photo"
        disabled={index === photos.length - 1}
        onClick={() => onNavigate(1)}
      >
        <Icon name="next" size={24} />
      </button>
    </div>
  );
}
