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
        // Strip MapLibre's default white popup wrapper
        if (!document.getElementById("brgy-popup-style")) {
          const style = document.createElement("style");
          style.id = "brgy-popup-style";
          style.textContent = `
            .brgy-popup .maplibregl-popup-content {
              background: transparent;
              border: none;
              border-radius: 0;
              padding: 0;
              box-shadow: none;
            }
            .brgy-popup .maplibregl-popup-tip {
              border-top-color: #161b27;
            }
          `;
          document.head.appendChild(style);
        }

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
            ? `<div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">${pin.summary.length > 110 ? pin.summary.slice(0, 110) + "…" : pin.summary}</div>`
            : "";

          const popup = new Popup({
            offset: 14,
            closeButton: false,
            maxWidth: "280px",
            className: "brgy-popup",
          }).setHTML(
            `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;padding:0;margin:0">
              <div style="background:linear-gradient(135deg,#1e2433 0%,#161b27 100%);border:1px solid rgba(255,255,255,0.1);border-radius:14px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.05)">
                <!-- colour accent bar -->
                <div style="height:3px;background:linear-gradient(90deg,${color},${color}88)"></div>
                <div style="padding:12px 14px 13px">
                  <!-- tag + id row -->
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
                    <span style="font-size:9.5px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.07em;background:${color}18;border:1px solid ${color}33;padding:2px 7px;border-radius:999px">${pin.tagging}</span>
                    <span style="font-size:9px;color:#6b7280;font-weight:600;letter-spacing:0.03em">#${pin.id}</span>
                  </div>
                  <!-- title -->
                  <div style="font-size:13px;font-weight:800;color:#f1f5f9;line-height:1.35;letter-spacing:-0.01em">${pin.title}</div>
                  ${summaryHtml}
                  <!-- footer row -->
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.07)">
                    <span style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;background:${color}20;color:${color};border:1px solid ${color}40;letter-spacing:0.02em">${label}</span>
                    <a href="/citizen/reports/${pin.id}" style="font-size:9px;color:#818cf8;display:flex;align-items:center;gap:4px;text-decoration:none;font-weight:600;transition:color 0.15s" onmouseover="this.style.color='#a5b4fc'" onmouseout="this.style.color='#818cf8'">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      View report
                    </a>
                  </div>
                </div>
              </div>
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
