import type { FavouriteList, FavouriteRoute, FavRouteStop } from "@/shared/types";

export const FAVOURITE_LISTS_KEY = "favourite-lists-v2";
const LEGACY_KEYS = ["favourites", "likedRouteStop"] as const;
const COMPANIES = ["KMB", "CTB", "NLB", "MTRBUS"] as const;

function makeDefaultList(routes: FavouriteRoute[] = []): FavouriteList {
  return {
    id: "default",
    name: "我的最愛",
    routes,
    isDefault: true,
    createdAt: Date.now(),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeRoute(value: unknown): FavouriteRoute | null {
  const route = asRecord(value);
  if (!route) return null;

  const stopId = route.stopId ?? route.stop ?? route.stop_id;
  const routeName = route.route ?? route.routeName ?? route.busRoute;
  const companyValue = String(route.company ?? "").toUpperCase();
  const company = COMPANIES.includes(companyValue as (typeof COMPANIES)[number])
    ? (companyValue as FavRouteStop["company"])
    : null;
  if (typeof stopId !== "string" || typeof routeName !== "string" || !company) {
    return null;
  }

  const rawDir = String(route.dir ?? route.bound ?? "O").toUpperCase();
  const dir = rawDir === "I" || rawDir.includes("IN") ? "I" : "O";
  return {
    stopId,
    route: routeName,
    company,
    dir,
    name_tc: String(route.name_tc ?? route.stopName_c ?? route.stopName ?? ""),
    name_en: String(route.name_en ?? route.stopName_e ?? ""),
    lat: typeof route.lat === "string" ? route.lat : undefined,
    long: typeof route.long === "string" ? route.long : undefined,
    dest_tc: String(route.dest_tc ?? route.destination ?? ""),
    serviceType:
      typeof route.serviceType === "string" ? route.serviceType : undefined,
    routeId:
      typeof route.routeId === "string" ? route.routeId : undefined,
  };
}

function uniqueRoutes(routes: FavouriteRoute[]): FavouriteRoute[] {
  const seen = new Set<string>();
  return routes.filter((route) => {
    const key = `${route.stopId}|${route.route}|${route.company}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseLegacyRoutes(raw: string, key: string): FavouriteRoute[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return uniqueRoutes(
      parsed
        .map(normalizeRoute)
        .filter((route): route is FavouriteRoute => route !== null),
    );
  } catch (error) {
    console.warn(`Unable to read legacy favourite data from "${key}".`, error);
    return [];
  }
}

function normalizeLists(value: unknown): FavouriteList[] {
  if (!Array.isArray(value)) return [];
  const lists: FavouriteList[] = [];

  for (const item of value) {
    const record = asRecord(item);
    if (!record || typeof record.id !== "string" || typeof record.name !== "string") {
      continue;
    }
    const name = record.name.trim();
    if (!name || name.length > 12) continue;
    const routes = Array.isArray(record.routes)
      ? uniqueRoutes(
          record.routes
            .map(normalizeRoute)
            .filter((route): route is FavouriteRoute => route !== null),
        )
      : [];
    lists.push({
      id: record.id,
      name,
      routes,
      isDefault: record.isDefault === true,
      createdAt:
        typeof record.createdAt === "number" ? record.createdAt : Date.now(),
      icon: typeof record.icon === "string" ? record.icon : undefined,
    });
  }

  if (lists.length === 0) return [makeDefaultList()];
  const defaultIndex = Math.max(
    0,
    lists.findIndex((list) => list.isDefault),
  );
  return lists.map((list, index) => ({
    ...list,
    isDefault: index === defaultIndex,
  }));
}

export function saveFavouriteLists(lists: FavouriteList[]): FavouriteList[] {
  const normalized = normalizeLists(lists);
  localStorage.setItem(FAVOURITE_LISTS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getFavouriteLists(): FavouriteList[] {
  if (typeof window === "undefined") return [makeDefaultList()];

  const stored = localStorage.getItem(FAVOURITE_LISTS_KEY);
  if (stored !== null) {
    try {
      const parsed: unknown = JSON.parse(stored);
      const lists = normalizeLists(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(lists)) {
        saveFavouriteLists(lists);
      }
      return lists;
    } catch (error) {
      console.warn("Unable to read saved favourite lists; restoring a default list.", error);
      const lists = [makeDefaultList()];
      return saveFavouriteLists(lists);
    }
  }

  const migratedRoutes = uniqueRoutes(
    LEGACY_KEYS.flatMap((key) => {
      const raw = localStorage.getItem(key);
      return raw === null ? [] : parseLegacyRoutes(raw, key);
    }),
  );
  return saveFavouriteLists([makeDefaultList(migratedRoutes)]);
}

export function getAllFavouriteRoutes(
  lists: FavouriteList[] = getFavouriteLists(),
): FavouriteRoute[] {
  return uniqueRoutes(lists.flatMap((list) => list.routes));
}

export function createFavouriteList(name: string): FavouriteList | null {
  const cleanName = name.trim();
  const lists = getFavouriteLists();
  if (
    !cleanName ||
    cleanName.length > 12 ||
    lists.some((list) => list.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())
  ) {
    return null;
  }

  const list: FavouriteList = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: cleanName,
    routes: [],
    isDefault: false,
    createdAt: Date.now(),
  };
  saveFavouriteLists([...lists, list]);
  return list;
}

export function renameFavouriteList(id: string, name: string): boolean {
  const cleanName = name.trim();
  const lists = getFavouriteLists();
  if (
    !cleanName ||
    cleanName.length > 12 ||
    lists.some(
      (list) =>
        list.id !== id &&
        list.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
    )
  ) {
    return false;
  }
  saveFavouriteLists(
    lists.map((list) => (list.id === id ? { ...list, name: cleanName } : list)),
  );
  return true;
}

export function setDefaultFavouriteList(id: string): FavouriteList[] {
  return saveFavouriteLists(
    getFavouriteLists().map((list) => ({ ...list, isDefault: list.id === id })),
  );
}

export function deleteFavouriteList(id: string): FavouriteList[] {
  const lists = getFavouriteLists();
  if (lists.length <= 1 || !lists.some((list) => list.id === id)) return lists;
  const remaining = lists.filter((list) => list.id !== id);
  if (!remaining.some((list) => list.isDefault)) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }
  return saveFavouriteLists(remaining);
}

export function addRouteToFavouriteList(
  id: string,
  route: FavouriteRoute,
): FavouriteList[] {
  return saveFavouriteLists(
    getFavouriteLists().map((list) => {
      if (list.id !== id) return list;
      const exists = list.routes.some(
        (item) =>
          item.stopId === route.stopId &&
          item.route === route.route &&
          item.company === route.company,
      );
      return exists ? list : { ...list, routes: [...list.routes, route] };
    }),
  );
}

export function removeRouteFromFavouriteList(
  id: string,
  route: Pick<FavRouteStop, "stopId" | "route" | "company">,
): FavouriteList[] {
  return saveFavouriteLists(
    getFavouriteLists().map((list) =>
      list.id === id
        ? {
            ...list,
            routes: list.routes.filter(
              (item) =>
                !(
                  item.stopId === route.stopId &&
                  item.route === route.route &&
                  item.company === route.company
                ),
            ),
          }
        : list,
    ),
  );
}
