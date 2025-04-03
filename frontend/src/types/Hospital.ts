export type Hospital = {
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
