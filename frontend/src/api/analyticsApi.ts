export interface AgeStructure {
    f0_14: number;
    f15_25: number;
    f26_35: number;
    f36_45: number;
    f46_55: number;
    f56_65: number;
    f66: number;
}

export async function fetchAgeStructure(district: string): Promise<AgeStructure> {
    const param = district !== "Все районы" ? `?district=${encodeURIComponent(district)}` : "";
    const res = await fetch(`http://127.0.0.1:8000/api/analytics/age-structure/${param}`);
    if (!res.ok) {
        throw new Error("Ошибка при загрузке возрастной структуры");
    }
    return res.json();
}
