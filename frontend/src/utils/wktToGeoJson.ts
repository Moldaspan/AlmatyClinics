// src/utils/wktToGeoJson.ts

import { parse as parseWKT } from "terraformer-wkt-parser";

/**
 * Удаляет префикс SRID=4326; (если есть) и конвертирует в GeoJSON-geometry
 */
export function wktToGeoJson(wktString: string) {
    const clean = wktString.replace(/^SRID=4326;/, "");
    const geometryObject = parseWKT(clean);
    // geometryObject будет типа { type: 'MultiPolygon'|'Polygon'|'Point', coordinates: [...] }
    return geometryObject;
}
