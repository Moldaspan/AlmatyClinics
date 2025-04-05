import { parse as parseWKT } from "terraformer-wkt-parser";

/**
 * Загружает данные о плотности населения и преобразует их в GeoJSON
 */
export async function getPopulationData(): Promise<GeoJSON.FeatureCollection> {
    const res = await fetch("http://127.0.0.1:8000/api/grids-population/");
    if (!res.ok) {
        throw new Error("Ошибка загрузки данных о населении");
    }

    const raw = await res.json();

    const features = raw.map((item: any) => {
        const geometry = parseWKT(item.geometry.replace(/^SRID=4326;/, ""));
        return {
            type: "Feature",
            geometry,
            properties: {
                population: item.total_sum_population,
                id: item.id,
            },
        };
    });

    return {
        type: "FeatureCollection",
        features,
    };
}
