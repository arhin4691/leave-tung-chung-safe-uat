"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { useLocale } from "@/shared/context/locale-context";
import classes from "./StopMap.module.css";

interface StopMapProps {
  lat?: string | number;
  long?: string | number;
  title: string;
  active?: boolean;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const StopMap: React.FC<StopMapProps> = ({
  lat,
  long,
  title,
  active = true,
}) => {
  const { t } = useLocale();
  const mapElementRef = useRef<HTMLDivElement>(null);
  const locationRequestedRef = useRef(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "available" | "unavailable"
  >("idle");
  const [mapError, setMapError] = useState(false);

  const hasCoordinates =
    lat !== undefined && long !== undefined && lat !== "" && long !== "";
  const latitude = Number(lat);
  const longitude = Number(long);
  const validCoordinates =
    hasCoordinates &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

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
    if (!active || !validCoordinates || !mapElementRef.current) return;

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
            .circleMarker(
              [userLocation.latitude, userLocation.longitude],
              {
                radius: 8,
                color: "#ffffff",
                weight: 2,
                fillColor: "#1683ff",
                fillOpacity: 1,
              },
            )
            .addTo(map);

          const isSameLocation =
            Math.abs(userLocation.latitude - latitude) < 0.0001 &&
            Math.abs(userLocation.longitude - longitude) < 0.0001;
          if (isSameLocation) {
            map.setView([latitude, longitude], 16);
          } else {
            map.fitBounds(
              [
                [latitude, longitude],
                [userLocation.latitude, userLocation.longitude],
              ],
              { padding: [24, 24], maxZoom: 16 },
            );
          }
        } else {
          map.setView([latitude, longitude], 16);
        }

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
  }, [active, latitude, longitude, title, userLocation, validCoordinates]);

  if (!validCoordinates) return null;

  return (
    <div>
      <div className={classes.mapFrame}>
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
      <div className={classes.mapLegend}>
        <span className={classes.legendItem}>
          <span className={`${classes.legendMarker} ${classes.stopMarker}`} />
          {t("bus.stopLocation")}
        </span>
        <span className={classes.legendItem}>
          <span className={`${classes.legendMarker} ${classes.userMarker}`} />
          {t("bus.currentLocation")}
        </span>
      </div>
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
