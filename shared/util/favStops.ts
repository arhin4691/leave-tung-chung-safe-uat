/**
 * Backwards-compatible helpers for route-stop favourites.
 * New favourites are stored in favourite-lists-v2.
 */

import type { FavRouteStop } from "@/shared/types";
import {
  addRouteToFavouriteList,
  getAllFavouriteRoutes,
  getFavouriteLists,
  removeRouteFromFavouriteList,
} from "@/shared/util/favouriteLists";

export function getFavStops(): FavRouteStop[] {
  return getAllFavouriteRoutes();
}

export function addFavStop(stop: FavRouteStop): void {
  const defaultList = getFavouriteLists().find((list) => list.isDefault);
  if (defaultList) addRouteToFavouriteList(defaultList.id, stop);
}

export function removeFavStop(
  stopId: string,
  route: string,
  company: string,
): void {
  for (const list of getFavouriteLists()) {
    const match = list.routes.find(
      (stop) =>
        stop.stopId === stopId && stop.route === route && stop.company === company,
    );
    if (match) removeRouteFromFavouriteList(list.id, match);
  }
}

export function isFavStop(
  stopId: string,
  route: string,
  company: string,
): boolean {
  return getAllFavouriteRoutes().some(
    (stop) =>
      stop.stopId === stopId && stop.route === route && stop.company === company,
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
