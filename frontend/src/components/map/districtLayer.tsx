import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { fetchDistricts } from "../../api/districtsApi";
import { DistrictFeatureDTO } from "../../types/District";
import { wktToGeoJson } from "../../utils/wktToGeoJson";
import { useDistrictFilterStore } from "../../store/districtFilterStore";

// Словарь ID → Цвет
const districtColors: Record<number, string> = {
    6: "#f3a683", // Медеуский
    4: "#f5cd79", // Бостандык
    0: "#78e08f", // Алматы г.
    7: "#60a3bc", // Наурызбай
    5: "#c8d6e5", // Жетысу
    1: "#ffa502", // Алатау
    8: "#ff6b81", // Турксиб
    3: "#546de5", // Ауэзов
    2: "#1dd1a1", // Алмалы
};

interface DistrictsLayerProps {
    map: mapboxgl.Map;
    visible: boolean;
}

const DistrictsLayer: React.FC<DistrictsLayerProps> = ({ map, visible }) => {
    const [districtsData, setDistrictsData] = useState<any>(null);
    const setSelectedDistrict = useDistrictFilterStore((state) => state.setSelectedDistrict);

    useEffect(() => {
        const loadDistricts = async () => {
            try {
                const data = await fetchDistricts();
                const geojsonFeatures = data.features.map((feature: DistrictFeatureDTO) => {
                    const geom = wktToGeoJson(feature.geometry);
                    return {
                        type: "Feature",
                        geometry: geom,
                        properties: {
                            ...feature.properties,
                            district_id: feature.id,
                        },
                    };
                });

                const featureCollection = {
                    type: "FeatureCollection",
                    features: geojsonFeatures,
                };

                setDistrictsData(featureCollection);
            } catch (error) {
                console.error("Failed to load districts:", error);
            }
        };

        loadDistricts();
    }, []);

    useEffect(() => {
        if (!map || !districtsData) return;

        const sourceId = "districts-source";
        const fillLayerId = "districts-fill";
        const lineLayerId = "districts-line";
        const labelLayerId = "districts-label";

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "geojson",
                data: districtsData,
            });

            map.addLayer({
                id: fillLayerId,
                type: "fill",
                source: sourceId,
                paint: {
                    "fill-color": [
                        "match",
                        ["get", "district_id"],

                        6, districtColors[6],
                        4, districtColors[4],
                        0, districtColors[0],
                        7, districtColors[7],
                        5, districtColors[5],
                        1, districtColors[1],
                        8, districtColors[8],
                        3, districtColors[3],
                        2, districtColors[2],

                        "#CCCCCC" // default
                    ],
                    "fill-opacity": 0.4,
                },
            });

            map.addLayer({
                id: lineLayerId,
                type: "line",
                source: sourceId,
                paint: {
                    "line-color": "#333",
                    "line-width": 2,
                },
            });

            map.addLayer({
                id: labelLayerId,
                type: "symbol",
                source: sourceId,
                layout: {
                    "text-field": ["get", "name_ru"],
                    "text-size": 14,
                    "text-anchor": "center",
                },
                paint: {
                    "text-color": "#111",
                    "text-halo-color": "#fff",
                    "text-halo-width": 1,
                },
            });

            map.on("click", fillLayerId, (e) => {
                if (!e.features || !e.features.length) return;
                const f = e.features[0];
                const props = f.properties as any;
                const name = props.name_ru || "Без названия";

                // Обновляем фильтр аналитики
                setSelectedDistrict(name);

                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<strong>${name}</strong>`)
                    .addTo(map);
            });

            const display = visible ? "visible" : "none";
            map.setLayoutProperty(fillLayerId, "visibility", display);
            map.setLayoutProperty(lineLayerId, "visibility", display);
            map.setLayoutProperty(labelLayerId, "visibility", display);

        } else {
            const src = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
            src.setData(districtsData);
        }
    }, [map, districtsData]);

    useEffect(() => {
        if (!map) return;

        const fill = map.getLayer("districts-fill");
        const line = map.getLayer("districts-line");
        const label = map.getLayer("districts-label");

        const display = visible ? "visible" : "none";

        if (fill) map.setLayoutProperty(fill.id, "visibility", display);
        if (line) map.setLayoutProperty(line.id, "visibility", display);
        if (label) map.setLayoutProperty(label.id, "visibility", display);
    }, [map, visible]);

    return null;
};

export default DistrictsLayer;
