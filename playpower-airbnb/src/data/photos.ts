const sources = import.meta.glob<string>("../assets/reference/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const publicPhotos = import.meta.glob<string>(
  "../assets/reference/public/*.jpg",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

// Category thumbnails retain screenshot framing; photo views use verified public media.
export function galleryAsset(id: string) {
  return publicPhotos[`../assets/reference/public/${id}.jpg`] ?? asset(id);
}

export function asset(id: string) {
  const source = sources[`../assets/reference/${id}.webp`];
  if (!source) throw new Error(`Missing reference image: ${id}`);
  return source;
}

export type Photo = { id: string; group: string; alt: string };
export const groups = [
  {
    id: "living-1",
    title: "Living room 1",
    thumbnail: "living-01",
    details: "Sofa · Air conditioning · Ceiling fan · TV",
  },
  {
    id: "living-2",
    title: "Living room 2",
    thumbnail: "terrace-side",
    details: "",
  },
  { id: "kitchen", title: "Full kitchen", thumbnail: "kitchen", details: "" },
  { id: "bedroom", title: "Bedroom", thumbnail: "bedroom", details: "" },
  {
    id: "bathroom",
    title: "Full bathroom",
    thumbnail: "bathroom",
    details: "",
  },
  { id: "gym", title: "Gym", thumbnail: "gym", details: "" },
  {
    id: "exterior",
    title: "Exterior",
    thumbnail: "exterior-aerial",
    details: "",
  },
  { id: "pool", title: "Pool", thumbnail: "pool", details: "" },
  {
    id: "additional",
    title: "Additional photos",
    thumbnail: "additional",
    details: "",
  },
];
export const photos: Photo[] = [
  {
    id: "living-01",
    group: "living-1",
    alt: "Living room with a mustard sofa, wooden coffee table, dining area and kitchen",
  },
  {
    id: "living-02",
    group: "living-1",
    alt: "Living room looking toward the television cabinet and kitchen",
  },
  {
    id: "living-03",
    group: "living-1",
    alt: "Another view of the sofa, coffee table and television in the living room",
  },
  {
    id: "terrace-front",
    group: "living-2",
    alt: "Terrace seating with woven chairs, white cushions, plants and wall lights",
  },
  {
    id: "terrace-side",
    group: "living-2",
    alt: "Side view of the terrace seating beside the hot tub",
  },
  {
    id: "kitchen",
    group: "kitchen",
    alt: "Wooden kitchen cabinets, black countertop and tiled backsplash",
  },
  {
    id: "bedroom",
    group: "bedroom",
    alt: "Bedroom with a double bed, window, bedside light and mirrored wardrobe",
  },
  {
    id: "bathroom",
    group: "bathroom",
    alt: "Bathroom with stone tiles, round mirror and shower",
  },
  {
    id: "gym",
    group: "gym",
    alt: "Gym with an exercise bike, treadmill and dumbbells",
  },
  {
    id: "exterior-aerial",
    group: "exterior",
    alt: "Aerial view of the apartment building and surrounding greenery",
  },
  {
    id: "exterior",
    group: "exterior",
    alt: "Apartment building with cream walls, balconies and a red roof",
  },
  {
    id: "pool",
    group: "pool",
    alt: "Swimming pool in the apartment courtyard",
  },
  {
    id: "additional",
    group: "additional",
    alt: "Terrace chairs and hot tub beneath the wall lights",
  },
  {
    id: "jacuzzi",
    group: "additional",
    alt: "White jacuzzi in a wooden surround on the terrace",
  },
];
export const heroIds = [
  "terrace-front",
  "terrace-side",
  "jacuzzi",
  "bedroom",
  "exterior",
];
export const photoById = (id: string) =>
  photos.find((photo) => photo.id === id)!;
export const referencePhotoTotal = 43; // Observed reference count; unavailable photos are never fabricated.
