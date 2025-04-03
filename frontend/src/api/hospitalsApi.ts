import { Hospital} from "../types/Hospital";

const API_URL = "http://127.0.0.1:8000/api/hospitals/";

export const fetchHospitals = async (): Promise<Hospital[]> => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.map((hospital: any) => ({
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
    } catch (error) {
        console.error("Error fetching hospitals:", error);
        return [];
    }
};