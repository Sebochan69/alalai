import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { appConfig } from "../../config/appConfig";
import { reportsAPI } from "../../services/api";

export default function MapPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    reportsAPI.getMapData().then(({ data }) => setReports(data));
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Complaint Map</h1>

      <div className="h-[600px] overflow-hidden rounded-xl bg-white shadow">
        <MapContainer
          center={[appConfig.map.defaultLat, appConfig.map.defaultLng]}
          zoom={appConfig.map.defaultZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reports.map((report) => (
            <Marker key={report.id} position={[report.latitude, report.longitude]}>
              <Popup>
                <strong>#{report.id} {report.tag}</strong>
                <br />
                {report.summary}
                <br />
                Status: {report.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
