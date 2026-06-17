import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

export type MapPlace = {
  placeId: string;
  name: string;
  category?: string;
  rating?: number | null;
  location?: { lat: number; lng: number };
};

type LeafletPlacesMapProps = {
  places: MapPlace[];
  userLocation?: { lat: number; lng: number };
  selectedPlaceId?: string;
  route?: [number, number][];
  onSelect: (placeId: string) => void;
};

export function LeafletPlacesMap({ places, userLocation, selectedPlaceId, route, onSelect }: LeafletPlacesMapProps) {
  const selectedPlace = places.find((place) => place.placeId === selectedPlaceId);
  const center = userLocation ?? places.find((place) => place.location)?.location ?? { lat: 28.6139, lng: 77.209 };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-[calc(100vh-168px)] min-h-[520px] w-full rounded-lg border border-border">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={import.meta.env.VITE_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
      />
      <MapController places={places} selectedLocation={selectedPlace?.location} userLocation={userLocation} />
      {userLocation ? (
        <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={8} pathOptions={{ color: "#ffffff", fillColor: "#0f766e", fillOpacity: 1, weight: 2 }}>
          <Popup>Your location</Popup>
        </CircleMarker>
      ) : null}
      {route?.length ? <Polyline positions={route} pathOptions={{ color: "#0f766e", weight: 5, opacity: 0.85 }} /> : null}
      {places.slice(0, 80).map((place) =>
        place.location ? (
          <Marker key={place.placeId} position={[place.location.lat, place.location.lng]} eventHandlers={{ click: () => onSelect(place.placeId) }}>
            <Popup>
              <button type="button" className="text-left" onClick={() => onSelect(place.placeId)}>
                <span className="block font-semibold">{place.name}</span>
                <span className="block text-xs text-slate-500">
                  {place.category} {place.rating ? `· ${place.rating}` : ""}
                </span>
              </button>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}

function MapController({
  places,
  selectedLocation,
  userLocation
}: {
  places: MapPlace[];
  selectedLocation?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, { duration: 0.6 });
      return;
    }

    const points = places.filter((place) => place.location).map((place) => [place.location!.lat, place.location!.lng] as [number, number]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length > 1) map.fitBounds(points, { padding: [42, 42] });
    else if (points.length === 1) map.setView(points[0], 14);
  }, [map, places, selectedLocation, userLocation]);

  return null;
}
