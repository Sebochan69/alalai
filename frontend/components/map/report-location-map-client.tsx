"use client";

import dynamic from "next/dynamic";

const ReportLocationMap = dynamic(
  () =>
    import("@/components/map/report-location-map").then(
      (m) => m.ReportLocationMap,
    ),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted/30 animate-pulse" />,
  },
);

export function ReportLocationMapClient({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  return <ReportLocationMap lat={lat} lng={lng} title={title} />;
}
