"use client";

import { useEffect, useRef } from "react";

export function ReportLocationMap({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    import("maplibre-gl").then((maplibre) => {
      if (cancelled || !mapRef.current) return;

      const { Map, Marker, Popup } = maplibre;
      const key = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
      const styleUrl = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${key}`;

      const map = new Map({
        container: mapRef.current!,
        style: styleUrl,
        center: [lng, lat],
        zoom: 17,
        attributionControl: false,
        interactive: false,
      });

      map.on("load", () => {
        const el = document.createElement("div");
        el.innerHTML = `<div style="width:28px;height:36px">
          <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:36px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
            <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="#8b5cf6"/>
            <circle cx="12" cy="8" r="4" fill="white" opacity="0.95"/>
          </svg>
        </div>`;

        const popup = new Popup({
          offset: 28,
          className: "report-location-popup",
        }).setHTML(
          `<span style="color:#e2e8f0;font-size:13px;font-weight:500">${title}</span>`,
        );

        new Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map)
          .togglePopup();

        // Inject dark popup styles once
        if (!document.getElementById("report-popup-style")) {
          const style = document.createElement("style");
          style.id = "report-popup-style";
          style.textContent = `
            .report-location-popup .maplibregl-popup-content {
              background: #1e1b2e;
              color: #e2e8f0;
              border: 1px solid rgba(139,92,246,0.3);
              border-radius: 8px;
              padding: 8px 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            }
            .report-location-popup .maplibregl-popup-tip {
              border-top-color: #1e1b2e;
            }
          `;
          document.head.appendChild(style);
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}
