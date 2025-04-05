import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

export function getPopulationNearHospital(
    features: any[],
    coords: [number, number]
): number {
    const hospitalPoint = point(coords);

    return features.reduce((sum, feature) => {
        try {
            const geometry = feature.geometry;

            if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
                const inside = booleanPointInPolygon(hospitalPoint, feature);
                if (inside) {
                    return sum + Number(feature.properties.population || 0);
                }
            }
        } catch (e) {
            console.warn("Ошибка при проверке полигона:", e);
        }

        return sum;
    }, 0);
}
