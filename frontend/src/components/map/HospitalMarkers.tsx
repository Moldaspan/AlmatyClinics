import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Hospital } from "../../types/Hospital";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";

interface Props {
    map: mapboxgl.Map;
    hospitals: Hospital[];
    userLocation: [number, number] | null;
    directions: MapboxDirections | null;
}

const HospitalMarkers: React.FC<Props> = ({ map, hospitals, userLocation, directions }) => {
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!map) return;

        // Удаление старых маркеров
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Добавление новых
        hospitals.forEach((hospital) => {
            const { longitude, latitude, name, address, categories } = hospital;

            if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) return;

            const marker = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .setPopup(
                    new mapboxgl.Popup().setHTML(
                        `<strong>${name}</strong><br>${address}<br><p>${categories}</p>`
                    )
                )
                .addTo(map);

            marker.getElement().addEventListener("click", () => {
                if (!userLocation) {
                    alert("Не удалось определить ваше местоположение");
                    return;
                }
                if (directions && "setDestination" in directions) {

                    directions.setDestination([longitude, latitude]);
                }
            });

            markersRef.current.push(marker);
        });
    }, [map, hospitals, directions, userLocation]);

    return null;
};

export default HospitalMarkers;
