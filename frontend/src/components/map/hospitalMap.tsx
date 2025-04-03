import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "./styles.css";
import { Hospital } from "../../types/Hospital";
import { fetchHospitals } from "../../api/hospitalsApi";
import DistrictsLayer from "./districtLayer";

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieWVyc3VsdGFuMjAwNCIsImEiOiJjbThoZGd1cjMwMTBqMmlzYjB5YXI5MnFmIn0.42TYRPw0vaxl7pnFMl8kkw";

const HospitalMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<Map | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [directions, setDirections] = useState<MapboxDirections | null>(null);
    const [userMarker, setUserMarker] = useState<mapboxgl.Marker | null>(null);
    const [showDistricts, setShowDistricts] = useState<boolean>(false);

    // 1. Загружаем список больниц
    useEffect(() => {
        const getHospitals = async () => {
            const hospitalsData = await fetchHospitals();
            setHospitals(hospitalsData);
        };
        getHospitals();
    }, []);

    // 2. Инициализация карты + Directions
    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        const initMap = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [76.889709, 43.238949], // Пример: центр на Алматы
            zoom: 12,
        });

        // Контролы навигации (Zoom, Rotate)
        initMap.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Геолокационный контрол (кнопка «Моя локация»)
        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
        });
        initMap.addControl(geolocateControl, "top-right");

        // Directions-контрол
        const directionsControl = new MapboxDirections({
            accessToken: MAPBOX_ACCESS_TOKEN,
            unit: "metric",
            profile: "mapbox/driving",
            // interactive: false, // Если хотите запретить ручной ввод
        });
        initMap.addControl(directionsControl, "top-left");
        setDirections(directionsControl);

        setMap(initMap);

        // При размонтировании — удаляем карту
        return () => initMap.remove();
    }, []);

    // 3. Определяем местоположение пользователя
    useEffect(() => {
        if (!map) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lng = position.coords.longitude;
                const lat = position.coords.latitude;
                console.log("My location is:", lat, lng);

                setUserLocation([lng, lat]);
                map.flyTo({ center: [lng, lat], zoom: 14 });

                // Добавим маркер «Вы здесь!»
                if (!userMarker) {
                    const marker = new mapboxgl.Marker({ color: "blue" })
                        .setLngLat([lng, lat])
                        .setPopup(new mapboxgl.Popup().setHTML("<b>Вы здесь!</b>"))
                        .addTo(map);
                    setUserMarker(marker);
                }
            },
            (error) => {
                console.error("Ошибка при получении геолокации:", error);
            },
            { enableHighAccuracy: true }
        );
    }, [map, userMarker]);

    // 4. По умолчанию точка A (Origin)
    useEffect(() => {
        if (!directions || !userLocation) return;

        directions.setOrigin({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: userLocation, // [lng, lat]
            },
            place_name: "Моё местоположение",
        });
    }, [directions, userLocation]);

    // 5. Расставляем маркеры клиник
    useEffect(() => {
        if (!map || !hospitals.length) return;

        hospitals.forEach((hospital) => {
            if (
                !hospital.longitude ||
                !hospital.latitude ||
                isNaN(hospital.longitude) ||
                isNaN(hospital.latitude)
            ) {
                console.warn("Некорректные координаты:", hospital);
                return;
            }

            const marker = new mapboxgl.Marker()
                .setLngLat([hospital.longitude, hospital.latitude])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
            <strong>${hospital.name}</strong><br>
            ${hospital.address}<br>
            <p>${hospital.categories}</p>
          `)
                )
                .addTo(map);

            // Клик по маркеру → Destination
            marker.getElement().addEventListener("click", () => {
                if (!directions) return;
                if (!userLocation) {
                    alert("Не удалось определить вашу геопозицию");
                    return;
                }
                directions.setDestination({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [hospital.longitude, hospital.latitude],
                    },
                    place_name: hospital.name || "Неизвестная клиника",
                });
            });
        });
    }, [map, hospitals, directions, userLocation]);

    return (
        <div className="hospital-map-container" style={{ position: "relative" }}>
            {/* Карта */}
            <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "100vh" }}
            />

            {/* Кнопка «Показать/Скрыть районы» */}
            <button
                className="toggle-districts-btn"
                onClick={() => setShowDistricts(!showDistricts)}
            >
                {showDistricts ? "Скрыть районы" : "Показать районы"}
            </button>

            {/* Подключаем слой районов (если карта создана) */}
            {map && <DistrictsLayer map={map} visible={showDistricts} />}
        </div>
    );
};

export default HospitalMap;
