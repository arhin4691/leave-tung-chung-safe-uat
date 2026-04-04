"use client";

import { UpdateContext } from "@/shared/context/update-context";
import { useState, useEffect, useCallback } from "react";
import BusFavList from "@/shared/components/bus_routes/components/BusFavList";
import InitToast from "@/shared/components/ui/InitToast";
import { getFavStops } from "@/shared/util/favStops";
import type { FavRouteStop } from "@/shared/types";

export default function FavouritePage() {
  const [likedItem, setLikedItem] = useState("");
  const [likedBack, setLikedBack] = useState("");
  const [likedNlb, setLikedNlb] = useState("");
  const [likedRouteStop, setLikedRouteStop] = useState<FavRouteStop[]>([]);

  const refreshRouteStops = useCallback(() => {
    setLikedRouteStop(getFavStops());
  }, []);

  useEffect(() => {
    localStorage.getItem("likedBus")
      ? setLikedItem(localStorage.getItem("likedBus")!.replace(/,\s*$/, ""))
      : setLikedItem("");
    localStorage.getItem("likedBack")
      ? setLikedBack(localStorage.getItem("likedBack")!.replace(/,\s*$/, ""))
      : setLikedBack("");
    localStorage.getItem("likedNlb")
      ? setLikedNlb(localStorage.getItem("likedNlb")!.replace(/,\s*$/, ""))
      : setLikedNlb("");
    setLikedRouteStop(getFavStops());
  }, []);

  return (
    <>
      <InitToast
        message={`這是你常用頁面`}
        theme="colored"
        duration={800}
        type="info"
        position="top-center"
        className="top-over"
      />
      <BusFavList
        data={JSON.parse("[" + likedItem + "]")}
        backData={JSON.parse("[" + likedBack + "]")}
        nlbData={JSON.parse("[" + likedNlb + "]")}
        routeStopData={likedRouteStop}
        onRouteStopRemoved={refreshRouteStops}
      />
    </>
  );
}
