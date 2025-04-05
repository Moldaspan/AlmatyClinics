import { DistrictResponse} from "../types/District";
import axios from "axios";
export async function fetchDistricts(): Promise<DistrictResponse> {
    const res = await fetch("http://127.0.0.1:8000/api/address-city-districts/");
    if (!res.ok) {
        throw new Error("Failed to fetch districts");
    }
    return res.json();
}

export async function fetchDistrictStats() {
    const res = await axios.get("http://localhost:8000/api/analytics/district-stats/");
    return res.data;
}
