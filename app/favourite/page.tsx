"use client";

import { UpdateContext } from "@/shared/context/update-context";
import { useState, useEffect, useCallback } from "react";
import BusFavList from "@/shared/components/bus_routes/components/BusFavList";
import { getFavStops } from "@/shared/util/favStops";
import type { FavRouteStop } from "@/shared/types";

function safeParse(raw: string) {
  try { return JSON.parse("[" + raw + "]"); } catch { return []; }
}

export default function FavouritePage() {
  const [likedItem, setLikedItem] = useState("");
  const [likedBack, setLikedBack] = useState("");
  const [likedNlb, setLikedNlb] = useState("");
  const [likedRouteStop, setLikedRouteStop] = useState<FavRouteStop[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshRouteStops = useCallback(() => {
    setLikedRouteStop(getFavStops());
  }, []);

  useEffect(() => {
    setLikedItem(localStorage.getItem("likedBus")?.replace(/,\s*$/, "") ?? "");
    setLikedBack(localStorage.getItem("likedBack")?.replace(/,\s*$/, "") ?? "");
    setLikedNlb(localStorage.getItem("likedNlb")?.replace(/,\s*$/, "") ?? "");
    setLikedRouteStop(getFavStops());
    setMounted(true);
  }, []);

  return (
    <UpdateContext.Provider
      value={{
        update: () => setLikedItem(localStorage.getItem("likedBus")?.replace(/,\s*$/, "") ?? ""),
        updateBack: () => setLikedBack(localStorage.getItem("likedBack")?.replace(/,\s*$/, "") ?? ""),
        updateNlb: () => setLikedNlb(localStorage.getItem("likedNlb")?.replace(/,\s*$/, "") ?? ""),
      }}
    >
      <BusFavList
        data={mounted ? safeParse(likedItem) : []}
        backData={mounted ? safeParse(likedBack) : []}
        nlbData={mounted ? safeParse(likedNlb) : []}
        routeStopData={mounted ? likedRouteStop : []}
        onRouteStopRemoved={refreshRouteStops}
      />
    </UpdateContext.Provider>
  );
}
