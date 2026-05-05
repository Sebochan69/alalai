"use client";

import { useEffect, useRef } from "react";

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

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  "for-review": "For Review",
  resolved: "Resolved",
};

function isDarkMode() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

// [lng, lat] for MapLibre — matches mock data coordinates (Manila/Quiapo area)
const BRGY_CENTER: [number, number] = [120.9842, 14.5997];
const BRGY_ZOOM = 15;

export function BrgyMapView({
  pins = [],
  onReady,
}: {
  pins?: MapPin[];
  onReady?: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("maplibre-gl").then((maplibre) => {
      const { Map, Marker, NavigationControl, Popup } = maplibre;

      const key = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
      const dark = isDarkMode();
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
        hqEl.innerHTML = `<div style="width:32px;height:40px">
          <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
            <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="#6366f1"/>
            <text x="12" y="11" text-anchor="middle" font-size="6" font-weight="900" fill="white" font-family="system-ui">HQ</text>
          </svg>
        </div>`;
        new Marker({ element: hqEl, anchor: "bottom" })
          .setLngLat(BRGY_CENTER)
          .setPopup(
            new Popup({ offset: 12, closeButton: false }).setHTML(
              `<div style="font-family:system-ui,sans-serif;font-size:12px;font-weight:700;color:#f9fafb;padding:2px 4px">Barangay Hall</div>`,
            ),
          )
          .addTo(map);

        // Complaint pins
        pins.forEach((pin) => {
          const color = STATUS_COLOR[pin.status] ?? "#94a3b8";
          const label = STATUS_LABEL[pin.status] ?? pin.status;

          const el = document.createElement("div");
          el.style.cssText = "cursor:pointer;";
          el.innerHTML = `<div style="width:26px;height:34px">
            <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="width:26px;height:34px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="${color}"/>
              <circle cx="12" cy="8" r="4" fill="white" opacity="0.9"/>
            </svg>
          </div>`;

          const summaryHtml = pin.summary
            ? `<div style="font-size:11px;color:#9ca3af;margin:5px 0 0;padding-top:5px;border-top:1px solid #374151;line-height:1.4">${pin.summary.length > 100 ? pin.summary.slice(0, 100) + "…" : pin.summary}</div>`
            : "";

          const popup = new Popup({
            offset: 12,
            closeButton: false,
            maxWidth: "260px",
          }).setHTML(
            `<div style="font-family:system-ui,sans-serif;padding:2px 4px">
              <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">${pin.tagging} · #${pin.id}</div>
              <div style="font-size:12px;font-weight:700;color:#f9fafb;line-height:1.3;margin-bottom:5px">${pin.title}</div>
              ${summaryHtml}
              <span style="display:inline-block;margin-top:6px;font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:${color}33;color:${color};border:1px solid ${color}55">${label}</span>
            </div>`,
          );

          new Marker({ element: el, anchor: "bottom" })
            .setLngLat([pin.lng, pin.lat])
            .setPopup(popup)
            .addTo(map);
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
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
