"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  status: "pending" | "in-progress" | "for-review" | "resolved";
  tagging: string;
  summary?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  "in-progress": "#3b82f6",
  "for-review": "#a855f7",
  resolved: "#10b981",
};

function isDarkMode() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

// Fallback [lng, lat] for MapLibre when no assigned location is available.
const BRGY_CENTER: [number, number] = [120.9842, 14.5997];
const BRGY_ZOOM = 15;

export function BrgyMapView({
  pins = [],
  onReady,
  center,
  selectedId,
  onPinClick,
  onCardPos,
}: {
  pins?: MapPin[];
  onReady?: () => void;
  center?: [number, number];
  selectedId?: string | null;
  onPinClick?: (id: string) => void;
  onCardPos?: (pos: { x: number; y: number } | null) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, MapLibreMarker>>({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("maplibre-gl").then((maplibre) => {
      const { Map, Marker, NavigationControl } = maplibre;

      const key = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
      const dark = isDarkMode();
      const getStyleUrl = (isDark: boolean) =>
        `https://api.maptiler.com/maps/${isDark ? "streets-v2-dark" : "streets-v2"}/style.json?key=${key}`;

      const map = new Map({
        container: mapRef.current!,
        style: getStyleUrl(dark),
        center: center ?? BRGY_CENTER,
        zoom: BRGY_ZOOM,
        attributionControl: false,
        fadeDuration: 0,
      });

      map.addControl(
        new NavigationControl({ showCompass: false }),
        "top-right",
      );

      map.on("load", () => {
        // Complaint pins
        pins.forEach((pin) => {
          const color = STATUS_COLOR[pin.status] ?? "#94a3b8";

          const el = document.createElement("div");
          el.style.cssText = "cursor:pointer;";
          el.innerHTML = `<div style="width:26px;height:34px">
            <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="width:26px;height:34px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="${color}"/>
              <circle cx="12" cy="8" r="4" fill="white" opacity="0.9"/>
            </svg>
          </div>`;

          el.addEventListener("click", () => {
            onPinClick?.(pin.id);
          });

          const marker = new Marker({ element: el, anchor: "bottom" })
            .setLngLat([pin.lng, pin.lat])
            .addTo(map);

          markersRef.current[pin.id] = marker;
        });

        onReady?.();
      });

      mapInstanceRef.current = map;

      // Watch for theme changes and swap map style live
      let lastDark = dark;
      const observer = new MutationObserver(() => {
        const nowDark = isDarkMode();
        if (nowDark !== lastDark) {
          lastDark = nowDark;
          map.setStyle(getStyleUrl(nowDark));
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!selectedId || !map) {
      onCardPos?.(null);
      return;
    }

    const marker = markersRef.current[selectedId];
    if (!marker) {
      onCardPos?.(null);
      return;
    }

    const lngLat = marker.getLngLat();
    const updatePos = () => {
      const currentMap = mapInstanceRef.current;
      if (!currentMap) return;
      const point = currentMap.project(lngLat);
      onCardPos?.({ x: point.x, y: point.y });
    };

    map.flyTo({ center: lngLat, zoom: 17.5, speed: 1.25, curve: 1.15 });
    updatePos();
    map.on("move", updatePos);
    map.on("zoom", updatePos);

    return () => {
      map.off("move", updatePos);
      map.off("zoom", updatePos);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
