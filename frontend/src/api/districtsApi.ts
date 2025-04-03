// src/api/districtsApi.ts

import { DistrictResponse} from "../types/District";

export async function fetchDistricts(): Promise<DistrictResponse> {
    const res = await fetch("http://127.0.0.1:8000/api/address-city-districts/");
    if (!res.ok) {
        throw new Error("Failed to fetch districts");
    }
    return res.json();
}
