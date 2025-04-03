// src/types/districts.ts

export interface DistrictFeatureDTO {
    id: number;
    type: string;      // "Feature"
    geometry: string;  // WKT, напр. "SRID=4326;MULTIPOLYGON(...)"
    properties: {
        name_kz: string;
        name_ru: string;
        marker: string;  // WKT POINT
        // ... любые другие поля (response_name_ru, gerb_img и т.д.)
    };
}

export interface DistrictResponse {
    type: string; // "FeatureCollection"
    features: DistrictFeatureDTO[];
}
