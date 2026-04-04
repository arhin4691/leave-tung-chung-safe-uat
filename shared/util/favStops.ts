/**
 * favStops — localStorage helpers for the new FavRouteStop system.
 *
 * Stores an array of FavRouteStop under the key "likedRouteStop".
 * A favourite is uniquely identified by (stopId, route, company).
 */

import type { FavRouteStop } from "@/shared/types";

const KEY = "likedRouteStop";

export function getFavStops(): FavRouteStop[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as FavRouteStop[];
  } catch {
    return [];
  }
}

function save(list: FavRouteStop[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addFavStop(stop: FavRouteStop): void {
  const list = getFavStops();
  const exists = list.some(
    (s) => s.stopId === stop.stopId && s.route === stop.route && s.company === stop.company,
  );
  if (!exists) {
    list.push(stop);
    save(list);
  }
}

export function removeFavStop(
  stopId: string,
  route: string,
  company: string,
): void {
  const list = getFavStops().filter(
    (s) =>
      !(s.stopId === stopId && s.route === route && s.company === company),
  );
  save(list);
}

export function isFavStop(
  stopId: string,
  route: string,
  company: string,
): boolean {
  return getFavStops().some(
    (s) => s.stopId === stopId && s.route === route && s.company === company,
  );
}

export function toggleFavStop(stop: FavRouteStop): boolean {
  if (isFavStop(stop.stopId, stop.route, stop.company)) {
    removeFavStop(stop.stopId, stop.route, stop.company);
    return false;
  }
  addFavStop(stop);
  return true;
}
