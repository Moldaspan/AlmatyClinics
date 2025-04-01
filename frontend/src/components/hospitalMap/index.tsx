import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Hospital = {
    id: number;
    name: string;
    address: string;
    district: string;
    categories: string;
    latitude: number; // В API это `y`
    longitude: number; // В API это `x`
    url_2gis: string; // В API это `gis_uri`
    website: string | null;
    email_1: string | null;
    phone_1: string | null;
    phone_2: string | null;
    phone_3: string | null;
};


const API_URL = "http://127.0.0.1:8000/api/hospitals/";
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieWVyc3VsdGFuMjAwNCIsImEiOiJjbThoZGd1cjMwMTBqMmlzYjB5YXI5MnFmIn0.42TYRPw0vaxl7pnFMl8kkw"; // Замени на свой токен

const HospitalMap: React.FC = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const mapContainerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => {
                const formattedData = data.map((hospital: any) => ({
                    id: hospital.id,
                    name: hospital.name,
                    address: hospital.address,
                    district: hospital.district,
                    categories: hospital.categories || "Не указано",
                    latitude: parseFloat(hospital.y),  // `y` → `latitude`
                    longitude: parseFloat(hospital.x), // `x` → `longitude`
                    url_2gis: hospital.gis_uri || "#",
                    website: hospital.website || null,
                    email_1: hospital.email_1 || null,
                    phone_1: hospital.phone_1 || null,
                    phone_2: hospital.phone_2 || null,
                    phone_3: hospital.phone_3 || null,
                }));
                setHospitals(formattedData);
            })
            .catch((error) => console.error("Error fetching hospitals:", error));
    }, []);

    useEffect(() => {
        console.log("Fetched hospitals data:", hospitals);
        if (!mapContainerRef.current) return;


        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [76.889709, 43.238949],
            zoom: 12,
        });

        hospitals.forEach((hospital) => {
            if (!hospital.latitude || !hospital.longitude || isNaN(hospital.latitude) || isNaN(hospital.longitude)) {
                console.error(`Invalid coordinates for hospital: ${hospital.name}`, hospital);
                return; // Пропускаем больницы с некорректными координатами
            }
            new mapboxgl.Marker()
                .setLngLat([hospital.longitude, hospital.latitude])
                .setPopup(
                    new mapboxgl.Popup().setHTML(
                        `<strong>${hospital.name}</strong><br>${hospital.address}<br><a href="${hospital.url_2gis}" target="_blank">Подробнее на 2GIS</a>`
                    )
                )
                .addTo(map);
        });

        return () => map.remove();
    }, [hospitals]);

    return <div ref={mapContainerRef} style={{ height: "100vh", width: "100%" }} />;
};

export default HospitalMap;
