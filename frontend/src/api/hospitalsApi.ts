import { Hospital} from "../types/Hospital";

export const fetchHospitals = async (district?: string): Promise<Hospital[]> => {
    try {
        let url = "http://127.0.0.1:8000/api/hospitals/";
        if (district && district !== "Все районы") {
            const encoded = encodeURIComponent(district);
            url += `?district=${encoded}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        return data.map((hospital: any) => ({
            id: hospital.id,
            name: hospital.name,
            address: hospital.address,
            district: hospital.district,
            categories: hospital.categories || "Не указано",
            latitude: parseFloat(hospital.y),
            longitude: parseFloat(hospital.x),
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
