import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "./styles.css";

import { Hospital } from "../../types/Hospital";
import { fetchHospitals } from "../../api/hospitalsApi";
import { fetchDistricts } from "../../api/districtsApi";
import { getPopulationData } from "../../api/populationApi";
import { calcDistanceKm } from "../../utils/calcDistance";
import { getPopulationNearHospital } from "../../utils/getPopulationNearHospital";

import DistrictsLayer from "./districtLayer";
import PopulationLayer from "./populationLayer";

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieWVyc3VsdGFuMjAwNCIsImEiOiJjbThoZGd1cjMwMTBqMmlzYjB5YXI5MnFmIn0.42TYRPw0vaxl7pnFMl8kkw";

const HospitalMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<Map | null>(null);
    const [directions, setDirections] = useState<MapboxDirections | null>(null);

    const [districts, setDistricts] = useState<string[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("Все районы");

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [topHospitals, setTopHospitals] = useState<any[]>([]);
    const [populationData, setPopulationData] = useState<any>(null);

    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [userMarker, setUserMarker] = useState<mapboxgl.Marker | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    const [showDistricts, setShowDistricts] = useState(false);
    const [showPopulationLayer, setShowPopulationLayer] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await fetchDistricts();
            setDistricts(res.features.map((f: any) => f.properties.name_ru));
        };
        load();
    }, []);

    useEffect(() => {
        const load = async () => {
            const res = await fetchHospitals(selectedDistrict);
            setHospitals(res);
        };
        load();
    }, [selectedDistrict]);

    useEffect(() => {
        const load = async () => {
            const res = await getPopulationData();
            setPopulationData(res);
        };
        load();
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

        const m = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [76.889709, 43.238949],
            zoom: 12,
        });

        m.addControl(new mapboxgl.NavigationControl(), "top-right");

        const geo = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
        });

        m.addControl(geo, "top-right");

        const dir = new MapboxDirections({
            accessToken: MAPBOX_ACCESS_TOKEN,
            unit: "metric",
            profile: "mapbox/driving",
        });

        m.addControl(dir, "top-left");
        setDirections(dir);
        setMap(m);

        return () => m.remove();
    }, []);

    useEffect(() => {
        if (!map) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: [number, number] = [
                    position.coords.longitude,
                    position.coords.latitude,
                ];
                setUserLocation(coords);
                map.flyTo({ center: coords, zoom: 14 });

                if (!userMarker) {
                    const marker = new mapboxgl.Marker({ color: "blue" })
                        .setLngLat(coords)
                        .setPopup(new mapboxgl.Popup().setHTML("<b>Вы здесь!</b>"))
                        .addTo(map);
                    setUserMarker(marker);
                }
            },
            (error) => console.error("Geo error:", error),
            { enableHighAccuracy: true }
        );
    }, [map]);

    useEffect(() => {
        if (!map) return;
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        hospitals.forEach((h) => {
            if (!h.latitude || !h.longitude) return;
            const marker = new mapboxgl.Marker()
                .setLngLat([h.longitude, h.latitude])
                .setPopup(new mapboxgl.Popup().setHTML(`<strong>${h.name}</strong><br>${h.address}`))
                .addTo(map);

            marker.getElement().addEventListener("click", () => {
                if (!userLocation || !directions) return;
                directions.setDestination([h.longitude, h.latitude]);
            });

            markersRef.current.push(marker);
        });
    }, [map, hospitals, directions, userLocation]);

    useEffect(() => {
        if (!userLocation || !populationData || !hospitals.length) return;

        const top = hospitals
            .map((h) => {
                const coords: [number, number] = [h.longitude, h.latitude];
                const dist = calcDistanceKm(userLocation, coords);
                const pop = getPopulationNearHospital(populationData.features, coords);
                const score = dist * 0.7 + pop * 0.0003;
                return { ...h, distance: dist.toFixed(2), population: pop, score };
            })
            .sort((a, b) => a.score - b.score)
            .slice(0, 5);

        setTopHospitals(top);
    }, [userLocation, hospitals, populationData]);
    useEffect(() => {
        if (userLocation && directions) {
            directions.setOrigin(userLocation);
        }
    }, [userLocation, directions]);

    return (
        <div className="map-page">
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
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>

                <button className="toggle-districts-btn2" onClick={() => setShowDistricts(!showDistricts)}>
                    {showDistricts ? "Скрыть районы" : "Показать районы"}
                </button>
                <button className="toggle-districts-btn2" onClick={() => setShowPopulationLayer(!showPopulationLayer)}>
                    {showPopulationLayer ? "Скрыть плотность населения" : "Показать плотность населения"}
                </button>

                <h3>🏥 Топ 5 ближайших больниц</h3>
                {topHospitals.map((h, i) => (
                    <div key={h.id} className="hospital-card">
                        <b>{i + 1}. {h.name}</b>
                        <div>📍 {h.distance} км</div>
                        <div>👥 Население поблизости: {h.population}</div>
                        <button
                            onClick={() => {
                                if (!directions || !userLocation) return;

                                directions.setOrigin(userLocation);
                                directions.setDestination([h.longitude, h.latitude]);
                                map?.flyTo({ center: [h.longitude, h.latitude], zoom: 14 });
                            }}
                        >
                            Проложить маршрут
                        </button>

                    </div>
                ))}
            </div>

            <div className="map-container">
                <div ref={mapContainerRef} className="mapbox-container" />
                {map && <DistrictsLayer map={map} visible={showDistricts} />}
                {map && <PopulationLayer map={map} visible={showPopulationLayer} />}
            </div>
        </div>
    );
};

export default HospitalMap;
