"use client";

import { useEffect, useRef } from "react";

export interface AdminPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  status: string;
  tagging: string;
  location: string;
  citizenName?: string;
  priority?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  "under-review": "#3b82f6",
  "in-progress": "#8b5cf6",
  resolved: "#10b981",
  closed: "#94a3b8",
};
const PRIORITY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const BRGY_CENTER: [number, number] = [120.9842, 14.5997];
const BRGY_ZOOM = 14.5;

function isDarkMode() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function AdminMapView({
  pins,
  selectedId,
  onPinClick,
  onCardPos,
  onReady,
}: {
  pins: AdminPin[];
  selectedId?: string | null;
  onPinClick?: (id: string) => void;
  onCardPos?: (pos: { x: number; y: number } | null) => void;
  onReady?: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("maplibre-gl").then((maplibre) => {
      const Map = maplibre.Map;
      const Marker = maplibre.Marker;
      const NavigationControl = maplibre.NavigationControl;

      const dark = isDarkMode();

      // MapTiler Streets v2 — light or dark based on theme
      const key = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
      const getStyleUrl = (isDark: boolean) =>
        `https://api.maptiler.com/maps/${isDark ? "streets-v2-dark" : "streets-v2"}/style.json?key=${key}`;

      const map = new Map({
        container: mapRef.current!,
        style: getStyleUrl(dark),
        center: BRGY_CENTER,
        zoom: BRGY_ZOOM,
        attributionControl: false,
        fadeDuration: 0,
      });

      map.addControl(
        new NavigationControl({ showCompass: false }),
        "top-right",
      );

      map.on("load", () => {
        // Barangay HQ marker
        const hqEl = document.createElement("div");
        hqEl.style.cssText = "cursor:pointer;";
        hqEl.innerHTML = `<div style="width:36px;height:44px">
          <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4))">
            <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="#8b5cf6"/>
            <text x="12" y="11" text-anchor="middle" font-size="7" font-weight="900" fill="white" font-family="system-ui">HQ</text>
          </svg>
        </div>`;
        new Marker({ element: hqEl, anchor: "bottom" })
          .setLngLat(BRGY_CENTER)
          .addTo(map);

        onReady?.();

        // Complaint pins — no Popup, click fires onPinClick callback
        pins.forEach((pin) => {
          const statusColor = STATUS_COLOR[pin.status] ?? "#94a3b8";
          const prio = pin.priority ?? "medium";
          const prioColor = PRIORITY_COLOR[prio] ?? "#f59e0b";

          const el = document.createElement("div");
          el.style.cssText = "cursor:pointer;";
          el.innerHTML = `<div style="width:32px;height:40px">
            <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.35))">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="${statusColor}"/>
              <circle cx="12" cy="8" r="4.5" fill="white" opacity="0.95"/>
              <circle cx="12" cy="8" r="3" fill="${prioColor}" opacity="0.9"/>
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
      // store observer for cleanup
      (map as any)._themeObserver = observer;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as any)._themeObserver?.disconnect();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to selected pin + track its projected position on every map move
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
      const m = mapInstanceRef.current;
      if (!m) return;
      const p = m.project(lngLat);
      onCardPos?.({ x: p.x, y: p.y });
    };

    // Fly then start tracking
    map.flyTo({ center: lngLat, zoom: 17, speed: 1.4, curve: 1.2 });
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
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
