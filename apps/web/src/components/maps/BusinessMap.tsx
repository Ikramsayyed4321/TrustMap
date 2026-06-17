import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";

type MapBusiness = {
  id: string;
  name: string;
  rating: number;
  coordinates: [number, number];
};

export function BusinessMap({ businesses }: { businesses: MapBusiness[] }) {
  const center = businesses[0]?.coordinates ?? [28.6139, 77.209];

  return (
    <MapContainer center={center} zoom={12} className="h-[420px] w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={import.meta.env.VITE_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
      />
      {businesses.map((business) => (
        <Marker key={business.id} position={business.coordinates}>
          <Popup>
            <Link to={`/businesses/${business.id}`} className="font-semibold">
              {business.name}
            </Link>
            <div>{business.rating.toFixed(1)} stars</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
