import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { FeatureCollection, Feature, Polygon } from "geojson";
import "./HospitalDemandPage.css";

mapboxgl.accessToken = "pk.eyJ1IjoieWVyc3VsdGFuMjAwNCIsImEiOiJjbThoZGd1cjMwMTBqMmlzYjB5YXI5MnFmIn0.42TYRPw0vaxl7pnFMl8kkw";

type ZoneFeature = Feature<Polygon, {
    id: number;
    population: number;
    x: number;
    y: number;
}>;

const LegendColor = ({ color, label }: { color: string; label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div style={{
            width: "20px",
            height: "20px",
            backgroundColor: color,
            border: "1px solid #ccc",
            borderRadius: "4px"
        }} />
        <span style={{ fontSize: "12px", color: "#555" }}>{label}</span>
    </div>
);

const getColorByPopulation = (population: number): string => {
    if (population > 6000) return "#a8071a";        // very high
    if (population > 4000) return "#ff4d4f";        // high
    if (population > 2500) return "#ff9999";        // medium
    return "#ffe6e6";                               // low
};

const HospitalDemandPage: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [zones, setZones] = useState<FeatureCollection<Polygon, any> | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/analytics/high-demand-zones/");
                const raw = await res.json();

                const features: ZoneFeature[] = raw.map((item: any) => {
                    const geometry = JSON.parse(item.geometry); // geometry уже GeoJSON
                    return {
                        type: "Feature",
                        geometry,
                        properties: {
                            id: item.id,
                            population: item.population,
                            x: item.x,
                            y: item.y
                        }
                    };
                });

                setZones({
                    type: "FeatureCollection",
                    features
                });
            } catch (e) {
                console.error("Ошибка загрузки зон:", e);
            }
        };

        fetchZones();
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const m = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [76.89, 43.24],
            zoom: 11
        });

        m.addControl(new mapboxgl.NavigationControl());
        setMap(m);

        return () => m.remove();
    }, []);

    useEffect(() => {
        if (!map || !zones) return;

        const sourceId = "zones";
        const layerId = "zones-layer";
        const highlightId = "highlight-layer";

        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getLayer(highlightId)) map.removeLayer(highlightId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        map.addSource(sourceId, {
            type: "geojson",
            data: zones
        });

        map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": [
                    "case",
                    ["has", "population"],
                    ["interpolate", ["linear"], ["get", "population"],
                        1500, "#ffe6e6",
                        2500, "#ff9999",
                        4000, "#ff4d4f",
                        6000, "#a8071a"
                    ],
                    "#cccccc"
                ],
                "fill-opacity": 0.6,
                "fill-outline-color": "#d9d9d9"
            }
        });

        map.addLayer({
            id: highlightId,
            type: "fill",
            source: sourceId,
            paint: {
                "fill-color": "#52c41a",
                "fill-opacity": 0.6
            },
            filter: ["==", "id", -1]
        });

        map.on("click", layerId, (e) => {
            const feature = e.features?.[0];
            if (!feature || !feature.properties) return;

            const { id, population } = feature.properties;
            setSelectedZoneId(id);
            map.setFilter(highlightId, ["==", "id", id]);

            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <strong>Зона ID: ${id}</strong><br/>
                    Население: ${population}
                `)
                .addTo(map);
        });

    }, [map, zones]);

    const flyToZone = (zone: ZoneFeature) => {
        if (!map) return;

        const [x, y] = [zone.properties.x, zone.properties.y];
        setSelectedZoneId(zone.properties.id);

        map.flyTo({
            center: [x, y],
            zoom: 14
        });

        map.setFilter("highlight-layer", ["==", "id", zone.properties.id]);
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar */}
            <div style={{ width: "300px", background: "#f5f5f5", padding: "12px", overflowY: "auto" }}>
                <h3>📌 Зоны с потребностью</h3>
                <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                    Ниже перечислены участки, в которых наблюдается нехватка клиник.
                </p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {zones?.features.map((zone) => (
                        <li
                            key={zone.properties?.id}
                            onClick={() => flyToZone(zone)}
                            style={{
                                padding: "8px",
                                cursor: "pointer",
                                background: zone.properties?.id === selectedZoneId ? "#d9f7be" : "transparent",
                                borderRadius: "6px",
                                marginBottom: "4px"
                            }}
                        >
                            🧭 Зона #{zone.properties?.id}<br />
                            👥 Население: {zone.properties?.population}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Map + Legend */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div ref={mapContainerRef} style={{ flex: 1 }} className="map-container" />

                {/* Legend */}
                <div style={{
                    height: "60px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                    borderTop: "1px solid #eee"
                }}>
                    <span style={{ fontSize: "14px", marginRight: "12px" }}>Плотность населения:</span>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <LegendColor color="#ffe6e6" label="Низкая" />
                        <LegendColor color="#ff9999" label="Средняя" />
                        <LegendColor color="#ff4d4f" label="Высокая" />
                        <LegendColor color="#a8071a" label="Очень высокая" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDemandPage;
