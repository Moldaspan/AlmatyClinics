declare module "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions" {
    import { IControl, LngLatLike, Map } from "mapbox-gl";

    // Описываем тип для GeoJSON "FeatureLike", который передаём в setOrigin/setDestination
    interface FeatureLike {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        };
        place_name?: string;                // Это то, что Directions отобразит в поле ввода
        properties?: Record<string, any>;   // Можно хранить доп. данные
    }

    interface MapboxDirectionsOptions {
        accessToken: string;
        unit?: "metric" | "imperial";
        profile?: "mapbox/driving" | "mapbox/walking" | "mapbox/cycling" | "mapbox/driving-traffic";
        alternatives?: boolean;
        congestion?: boolean;
        geometries?: "polyline" | "geojson";
        language?: string;
        overview?: "full" | "simplified" | "none";
        interactive?: boolean;
        placeholderOrigin?: string;
        placeholderDestination?: string;
        controls?: {
            inputs?: boolean;
            instructions?: boolean;
            profileSwitcher?: boolean;
        };
        zoom?: number;
        flyTo?: boolean;
        styles?: any;
    }

    export default class MapboxDirections implements IControl {
        constructor(options?: MapboxDirectionsOptions);

        // Методы IControl
        onAdd(map: Map): HTMLElement;
        onRemove(): void;

        // Расширяем методы, чтобы принимали "FeatureLike"
        setOrigin(origin: string | LngLatLike | FeatureLike): void;
        setDestination(destination: string | LngLatLike | FeatureLike): void;

        getOrigin(): any;
        getDestination(): any;
        setProfile(profile: "mapbox/driving" | "mapbox/walking" | "mapbox/cycling" | "mapbox/driving-traffic"): void;
        setLanguage(language: string): void;
        setUnit(unit: "metric" | "imperial"): void;

        // При необходимости можно добавлять дополнительные методы:
        // reverseGeocodeLocation(point: LngLatLike, callback: (err: any, data: any) => void): void;
        // geocode(query: string, callback: (err: any, data: any) => void): void;
    }
}
