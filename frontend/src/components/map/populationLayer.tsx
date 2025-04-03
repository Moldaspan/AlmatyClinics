import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { parse as parseWKT } from "terraformer-wkt-parser";

interface PopulationLayerProps {
    map: mapboxgl.Map;
    visible: boolean;
}

const PopulationLayer: React.FC<PopulationLayerProps> = ({ map, visible }) => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/grids-population/");
                const raw = await res.json();

                const features = raw.map((item: any) => {
                    const geometry = parseWKT(item.geometry.replace(/^SRID=4326;/, ""));
                    return {
                        type: "Feature",
                        geometry,
                        properties: {
                            population: item.total_sum_population,
                            id: item.id,
                        },
                    };
                });

                setData({
                    type: "FeatureCollection",
                    features,
                });
            } catch (e) {
                console.error("Ошибка загрузки данных о населении", e);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (!map || !data) return;

        const sourceId = "population-source";
        const layerId = "population-layer";

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "geojson",
                data,
            });

            map.addLayer({
                id: layerId,
                type: "fill",
                source: sourceId,
                paint: {
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        ["get", "population"],
                        0, "#f1f2f6",
                        500, "#d1ccc0",
                        1000, "#ffa502",
                        3000, "#ff6348",
                        7000, "#ff4757"
                    ],
                    "fill-opacity": 0.6,
                },
            });

            map.on("click", layerId, (e) => {
                const props = e.features?.[0]?.properties;
                const population = props?.population || "Неизвестно";
                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<strong>Население:</strong> ${population}`)
                    .addTo(map);
            });
        } else {
            const src = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
            src.setData(data);
        }

        map.setLayoutProperty("population-layer", "visibility", visible ? "visible" : "none");
    }, [map, data]);

    useEffect(() => {
        if (!map) return;
        const layer = map.getLayer("population-layer");
        if (layer) {
            map.setLayoutProperty(layer.id, "visibility", visible ? "visible" : "none");
        }
    }, [map, visible]);

    return null;
};

export default PopulationLayer;
