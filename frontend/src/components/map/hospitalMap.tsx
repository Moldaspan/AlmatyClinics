import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "./styles.css";
import { Hospital } from "../../types/Hospital";
import { fetchHospitals } from "../../api/hospitalsApi";
import { fetchDistricts } from "../../api/districtsApi";
import DistrictsLayer from "./districtLayer";
import PopulationLayer from "./populationLayer";

const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1IjoieWVyc3VsdGFuMjAwNCIsImEiOiJjbThoZGd1cjMwMTBqMmlzYjB5YXI5MnFmIn0.42TYRPw0vaxl7pnFMl8kkw";

const HospitalMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<Map | null>(null);

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [directions, setDirections] = useState<MapboxDirections | null>(null);
    const [userMarker, setUserMarker] = useState<mapboxgl.Marker | null>(null);

    const [showDistricts, setShowDistricts] = useState<boolean>(false);
    const [showPopulationLayer, setShowPopulationLayer] = useState<boolean>(false);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("Все районы");
    const [districts, setDistricts] = useState<string[]>([]);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    // Получение списка районов
    useEffect(() => {
        const fetchDistrictsList = async () => {
            const data = await fetchDistricts();
            const names = data.features.map((f: any) => f.properties.name_ru);
            setDistricts(names);
        };
        fetchDistrictsList();
    }, []);

    // Загрузка клиник по району
    useEffect(() => {
        const getHospitals = async () => {
            const hospitalsData = await fetchHospitals(selectedDistrict);
            setHospitals(hospitalsData);
        };
        getHospitals();
    }, [selectedDistrict]);

    // Инициализация карты
    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        const initMap = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [76.889709, 43.238949],
            zoom: 12,
        });

        initMap.addControl(new mapboxgl.NavigationControl(), "top-right");

        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
        });
        initMap.addControl(geolocateControl, "top-right");

        const directionsControl = new MapboxDirections({
            accessToken: MAPBOX_ACCESS_TOKEN,
            unit: "metric",
            profile: "mapbox/driving",
        });
        initMap.addControl(directionsControl, "top-left");
        setDirections(directionsControl);

        setMap(initMap);

        return () => initMap.remove();
    }, []);

    // Геолокация пользователя
    useEffect(() => {
        if (!map) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lng = position.coords.longitude;
                const lat = position.coords.latitude;
                setUserLocation([lng, lat]);
                map.flyTo({ center: [lng, lat], zoom: 14 });

                if (!userMarker) {
                    const marker = new mapboxgl.Marker({ color: "blue" })
                        .setLngLat([lng, lat])
                        .setPopup(new mapboxgl.Popup().setHTML("<b>Вы здесь!</b>"))
                        .addTo(map);
                    setUserMarker(marker);
                }
            },
            (error) => {
                console.error("Ошибка геолокации:", error);
            },
            { enableHighAccuracy: true }
        );
    }, [map, userMarker]);

    // Установка начальной точки маршрута
    useEffect(() => {
        if (!directions || !userLocation) return;

        directions.setOrigin({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: userLocation,
            },
            place_name: "Моё местоположение",
        });
    }, [directions, userLocation]);

    // Отображение маркеров клиник
    useEffect(() => {
        if (!map) return;

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        hospitals.forEach((hospital) => {
            const lng = hospital.longitude;
            const lat = hospital.latitude;

            if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
                console.warn("Некорректные координаты:", hospital);
                return;
            }

            const marker = new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .setPopup(
                    new mapboxgl.Popup().setHTML(
                        `<strong>${hospital.name}</strong><br>
                         ${hospital.address}<br>
                         <p>${hospital.categories}</p>`
                    )
                )
                .addTo(map);

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
                        coordinates: [lng, lat],
                    },
                    place_name: hospital.name || "Неизвестная клиника",
                });
            });

            markersRef.current.push(marker);
        });
    }, [map, hospitals, directions, userLocation]);

    // Список клиник
    const renderHospitalList = () => {
        if (!hospitals.length) {
            return <p>Нет клиник для данного района.</p>;
        }

        return hospitals.map((h) => (
            <div className="hospital-card" key={h.id}>
                <div className="hospital-card__name">{h.name}</div>
                <div className="hospital-card__address">{h.address}</div>
                <div className="hospital-card__categories">{h.categories}</div>
            </div>
        ));
    };

    return (
        <div className="map-page">
            {/* Сайдбар */}
            <div className="sidebar">
                <h2>Фильтры</h2>
                <label>Район:</label>
                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="district-select"
                >
                    <option value="Все районы">Все районы</option>
                    {districts.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>

                <button
                    className="toggle-districts-btn2"
                    onClick={() => setShowDistricts(!showDistricts)}
                >
                    {showDistricts ? "Скрыть районы" : "Показать районы"}
                </button>

                <button
                    className="toggle-districts-btn2"
                    onClick={() => setShowPopulationLayer(!showPopulationLayer)}
                >
                    {showPopulationLayer ? "Скрыть плотность населения" : "Показать плотность населения"}
                </button>

                <h3>Список клиник</h3>
                <div className="hospital-list">{renderHospitalList()}</div>
            </div>

            {/* Карта */}
            <div className="map-container">
                <div ref={mapContainerRef} className="mapbox-container" />
                {map && <DistrictsLayer map={map} visible={showDistricts} />}
                {map && <PopulationLayer map={map} visible={showPopulationLayer} />}
            </div>
        </div>
    );
};

export default HospitalMap;
