import { FeatureCollection, Geometry } from "geojson";
import { calcDistanceKm } from "./calcDistance";

export function getPopulationNearHospital(
    populationData: FeatureCollection<Geometry, any>,
    hospitalLocation: [number, number],
    radiusKm: number = 0.7
): number {
    if (!populationData) return 0;

    return populationData.features.reduce((total, feature) => {
        const coords = getCenterOfGeometry(feature.geometry);
        if (!coords) return total;

        const distance = calcDistanceKm(hospitalLocation, coords);
        if (distance <= radiusKm) {
            const pop = Number(feature.properties.population) || 0;
            return total + pop;
        }
        return total;
    }, 0);
}

function getCenterOfGeometry(geometry: Geometry): [number, number] | null {
    if (geometry.type === "Polygon") {
        const coords = geometry.coordinates[0];
        const [sumLon, sumLat] = coords.reduce(
            ([lonAcc, latAcc], [lon, lat]) => [lonAcc + lon, latAcc + lat],
            [0, 0]
        );
        const n = coords.length;
        return [sumLon / n, sumLat / n];
    }
    return null;
}
