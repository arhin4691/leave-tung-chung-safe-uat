"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type {
  BusRouteShapeCollection,
  RouteShapeCoordinate,
  SelectedStopInfo,
} from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";
import classes from "./StopMap.module.css";

interface StopMapProps {
  lat?: string | number;
  long?: string | number;
  title: string;
  active?: boolean;
  route?: string;
  company?: SelectedStopInfo["company"];
  direction?: "I" | "O";
  routeId?: string;
  serviceType?: string;
  destination?: string;
  currentStopId?: string;
  routeStops?: SelectedStopInfo[];
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DirectionArrow extends Coordinates {
  bearing: number;
}

const ROUTE_SHAPE_COMPANIES = new Set(["KMB", "CTB", "NLB"]);
const ARROW_SPACING_METERS = 900;

function isCoordinate(value: unknown): value is RouteShapeCoordinate {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function isRouteShapeCollection(
  value: unknown,
): value is BusRouteShapeCollection {
  if (!value || typeof value !== "object") return false;
  const collection = value as Record<string, unknown>;
  if (
    collection.type !== "FeatureCollection" ||
    !Array.isArray(collection.features) ||
    collection.features.length === 0
  ) {
    return false;
  }

  return collection.features.every((feature) => {
    if (!feature || typeof feature !== "object") return false;
    const geometry = (feature as Record<string, unknown>).geometry;
    if (!geometry || typeof geometry !== "object") return false;
    const routeGeometry = geometry as Record<string, unknown>;
    const coordinates = routeGeometry.coordinates;
    if (!Array.isArray(coordinates)) return false;
    if (routeGeometry.type === "LineString") {
      return coordinates.length > 1 && coordinates.every(isCoordinate);
    }
    if (routeGeometry.type === "MultiLineString") {
      return (
        coordinates.length > 0 &&
        coordinates.every(
          (line) =>
            Array.isArray(line) &&
            line.length > 1 &&
            line.every(isCoordinate),
        )
      );
    }
    return false;
  });
}

function routeLines(shape: BusRouteShapeCollection): RouteShapeCoordinate[][] {
  return shape.features.flatMap((feature) =>
    feature.geometry.type === "LineString"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates,
  );
}

function distanceMeters(from: RouteShapeCoordinate, to: RouteShapeCoordinate) {
  const radians = Math.PI / 180;
  const latitudeDelta = (to[1] - from[1]) * radians;
  const longitudeDelta = (to[0] - from[0]) * radians;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(from[1] * radians) *
      Math.cos(to[1] * radians) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDegrees(from: RouteShapeCoordinate, to: RouteShapeCoordinate) {
  const radians = Math.PI / 180;
  const fromLatitude = from[1] * radians;
  const toLatitude = to[1] * radians;
  const longitudeDelta = (to[0] - from[0]) * radians;
  const y = Math.sin(longitudeDelta) * Math.cos(toLatitude);
  const x =
    Math.cos(fromLatitude) * Math.sin(toLatitude) -
    Math.sin(fromLatitude) * Math.cos(toLatitude) * Math.cos(longitudeDelta);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getDirectionArrows(lines: RouteShapeCoordinate[][]): DirectionArrow[] {
  const arrows: DirectionArrow[] = [];

  for (const line of lines) {
    let distanceToNextArrow = ARROW_SPACING_METERS;

    for (let index = 1; index < line.length; index += 1) {
      const from = line[index - 1];
      const to = line[index];
      const segmentLength = distanceMeters(from, to);
      if (!Number.isFinite(segmentLength) || segmentLength <= 0) continue;

      let consumedDistance = 0;
      while (segmentLength - consumedDistance >= distanceToNextArrow) {
        consumedDistance += distanceToNextArrow;
        const fraction = consumedDistance / segmentLength;
        arrows.push({
          longitude: from[0] + (to[0] - from[0]) * fraction,
          latitude: from[1] + (to[1] - from[1]) * fraction,
          bearing: bearingDegrees(from, to),
        });
        distanceToNextArrow = ARROW_SPACING_METERS;
      }
      distanceToNextArrow -= segmentLength - consumedDistance;
    }
  }

  return arrows;
}

function validLocation(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

const StopMap: React.FC<StopMapProps> = ({
  lat,
  long,
  title,
  active = true,
  route,
  company,
  direction,
  routeId,
  serviceType,
  destination,
  currentStopId,
  routeStops,
}) => {
  const { t } = useLocale();
  const mapElementRef = useRef<HTMLDivElement>(null);
  const locationRequestedRef = useRef(false);
  const loadedRouteKeyRef = useRef<string | null>(null);
  const requestedRouteKeyRef = useRef<string | null>(null);
  const routeStopsRef = useRef(routeStops);
  routeStopsRef.current = routeStops;
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "available" | "unavailable"
  >("idle");
  const [mapError, setMapError] = useState(false);
  const [routeShape, setRouteShape] =
    useState<BusRouteShapeCollection | null>(null);
  const [routeStatus, setRouteStatus] = useState<
    "idle" | "loading" | "available" | "unavailable" | "error"
  >("idle");

  const hasCoordinates =
    lat !== undefined && long !== undefined && lat !== "" && long !== "";
  const latitude = Number(lat);
  const longitude = Number(long);
  const validCoordinates =
    hasCoordinates && validLocation(latitude, longitude);
  const routeStopIds = (routeStops ?? [])
    .map((stop) => stop.stopId)
    .filter(Boolean)
    .join(",");
  const routeKey = [
    company ?? "",
    route ?? "",
    direction ?? "",
    routeId ?? "",
    serviceType ?? "",
    destination ?? "",
    routeStopIds,
  ].join("|");

  useEffect(() => {
    if (!active || !validCoordinates || locationRequestedRef.current) return;
    locationRequestedRef.current = true;

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("available");
      },
      () => setLocationStatus("unavailable"),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, [active, validCoordinates]);

  useEffect(() => {
    if (!active || !route || !company || !direction) return;
    if (loadedRouteKeyRef.current === routeKey) return;
    if (requestedRouteKeyRef.current === routeKey) return;

    if (!ROUTE_SHAPE_COMPANIES.has(company)) {
      setRouteStatus("unavailable");
      loadedRouteKeyRef.current = routeKey;
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    requestedRouteKeyRef.current = routeKey;
    setRouteStatus("loading");
    setRouteShape(null);

    const params = new URLSearchParams({
      route,
      company,
      dir: direction,
      stopIds: routeStopIds,
    });
    if (routeId) params.set("routeId", routeId);
    if (serviceType) params.set("serviceType", serviceType);
    if (destination) params.set("destination", destination);

    void fetch(`/api/bus-route-shape?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) return null;
        if (!response.ok) {
          throw new Error(`Route shape request returned ${response.status}`);
        }
        const value: unknown = await response.json();
        if (!isRouteShapeCollection(value)) {
          throw new Error("Route shape response has an invalid format");
        }
        return value;
      })
      .then((shape) => {
        if (cancelled) return;
        requestedRouteKeyRef.current = null;
        loadedRouteKeyRef.current = routeKey;
        setRouteShape(shape);
        setRouteStatus(shape ? "available" : "unavailable");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        requestedRouteKeyRef.current = null;
        console.error("[StopMap] Failed to load route geometry:", error);
        setRouteStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (requestedRouteKeyRef.current === routeKey) {
        requestedRouteKeyRef.current = null;
      }
    };
  }, [
    active,
    company,
    destination,
    direction,
    route,
    routeId,
    routeKey,
    routeStopIds,
    serviceType,
  ]);

  useEffect(() => {
    if (!active || !validCoordinates || !mapElementRef.current) return;
    const routeShapeExpected =
      route !== undefined &&
      company !== undefined &&
      direction !== undefined &&
      ROUTE_SHAPE_COMPANIES.has(company);
    if (
      routeShapeExpected &&
      (routeStatus === "idle" || routeStatus === "loading")
    ) {
      return;
    }

    let cancelled = false;
    let map: LeafletMap | null = null;

    const initializeMap = async () => {
      try {
        const leaflet = await import("leaflet");
        if (cancelled || !mapElementRef.current) return;

        map = leaflet.map(mapElementRef.current, {
          scrollWheelZoom: false,
        });
        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 19,
          })
          .addTo(map);

        if (routeShape) {
          for (const line of routeLines(routeShape)) {
            const lineCoordinates = line.map(
              ([routeLongitude, routeLatitude]): [number, number] => [
                routeLatitude,
                routeLongitude,
              ],
            );
            leaflet
              .polyline(lineCoordinates, {
                color: "#ffffff",
                opacity: 0.78,
                weight: 8,
                lineCap: "round",
                lineJoin: "round",
              })
              .addTo(map);
            leaflet
              .polyline(lineCoordinates, {
                color: "#1677ff",
                opacity: 0.96,
                weight: 4,
                lineCap: "round",
                lineJoin: "round",
              })
              .addTo(map);
          }

          for (const arrow of getDirectionArrows(routeLines(routeShape))) {
            const icon = leaflet.divIcon({
              className: classes.routeArrowMarker,
              html: `<span class="${classes.routeArrowGlyph}" style="transform:rotate(${arrow.bearing}deg)">▲</span>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            leaflet
              .marker([arrow.latitude, arrow.longitude], { icon, interactive: false })
              .addTo(map);
          }
        }

        for (const stop of routeStopsRef.current ?? []) {
          if (stop.stopId === currentStopId) continue;
          const stopLatitude = Number(stop.lat);
          const stopLongitude = Number(stop.long);
          if (!validLocation(stopLatitude, stopLongitude)) continue;
          leaflet
            .circleMarker([stopLatitude, stopLongitude], {
              radius: 4,
              color: "#ffffff",
              weight: 1,
              fillColor: "#f59e0b",
              fillOpacity: 1,
            })
            .addTo(map);
        }

        leaflet
          .circleMarker([latitude, longitude], {
            radius: 8,
            color: "#ffffff",
            weight: 2,
            fillColor: "#e53935",
            fillOpacity: 1,
          })
          .addTo(map);

        if (userLocation) {
          leaflet
            .circleMarker([userLocation.latitude, userLocation.longitude], {
              radius: 8,
              color: "#ffffff",
              weight: 2,
              fillColor: "#1683ff",
              fillOpacity: 1,
            })
            .addTo(map);
        }

        map.setView([latitude, longitude], 17);

        window.requestAnimationFrame(() => map?.invalidateSize());
        setMapError(false);
      } catch (error) {
        if (!cancelled) {
          console.error("[StopMap] Failed to load map:", error);
          setMapError(true);
        }
      }
    };

    void initializeMap();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [
    active,
    company,
    currentStopId,
    direction,
    latitude,
    longitude,
    route,
    routeStatus,
    routeShape,
    title,
    userLocation,
    validCoordinates,
  ]);

  if (!validCoordinates) return null;

  return (
    <div>
      <div className={classes.mapFrame} data-map-gesture>
        <div
          ref={mapElementRef}
          className={classes.mapCanvas}
          aria-label={`${title} ${t("bus.mapSectionTitle")}`}
        />
      </div>
      {mapError && (
        <div className={classes.mapStatus} role="status">
          {t("bus.mapLoadError")}
        </div>
      )}
      {routeStatus === "loading" && (
        <div className={classes.mapStatus} role="status" aria-live="polite">
          {t("bus.routeLoading")}
        </div>
      )}
      {routeStatus === "unavailable" && (
        <div className={classes.mapStatus} role="status" aria-live="polite">
          {t("bus.routeUnavailable")}
        </div>
      )}
      {routeStatus === "error" && (
        <div className={classes.mapStatus} role="status" aria-live="polite">
          {t("bus.routeLoadError")}
        </div>
      )}
      <div className={classes.mapLegend}>
        {routeStatus === "available" && (
          <>
            <span className={classes.legendItem}>
              <span className={classes.routeLineMarker} />
              {t("bus.routeLine")}
            </span>
            <span className={classes.legendItem}>
              <span className={`${classes.legendMarker} ${classes.routeStopMarker}`} />
              {t("bus.routeStops")}
            </span>
          </>
        )}
        <span className={classes.legendItem}>
          <span className={`${classes.legendMarker} ${classes.stopMarker}`} />
          {t("bus.stopLocation")}
        </span>
        <span className={classes.legendItem}>
          <span className={`${classes.legendMarker} ${classes.userMarker}`} />
          {t("bus.currentLocation")}
        </span>
      </div>
      {routeStatus === "available" && (
        <div className={classes.mapAttribution}>
          {t("bus.routeDataAttribution")}{" "}
          <a
            href="https://github.com/hkbus/route-waypoints"
            target="_blank"
            rel="noreferrer"
          >
            HK Bus Crawling
          </a>
        </div>
      )}
      {locationStatus === "locating" && (
        <div className={classes.mapStatus} role="status" aria-live="polite">
          {t("bus.locating")}
        </div>
      )}
      {locationStatus === "unavailable" && (
        <div className={classes.mapStatus} role="status" aria-live="polite">
          {t("bus.locationUnavailable")}
        </div>
      )}
    </div>
  );
};

export default StopMap;
