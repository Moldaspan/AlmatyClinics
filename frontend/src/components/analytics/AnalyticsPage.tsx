import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Label
} from "recharts";
import Papa from "papaparse";
import "./analyticsPage.css";
import { useDistrictFilterStore } from "../../store/districtFilterStore";
import { fetchAgeStructure, AgeStructure } from "../../api/analyticsApi";

interface DistrictStat {
    district: string;
    population: number;
    clinic_count: number;
    population_per_clinic: number;
    status: string;
    score?: number;
}

const COLORS = {
    normal: "#4CAF50",
    overloaded: "#F44336"
};

const PIE_COLORS = [
    "#4DB6AC", "#9575CD", "#F06292", "#BA68C8", "#4FC3F7",
    "#AED581", "#FF8A65", "#7986CB", "#FFD54F", "#A1887F"
];

const AnalyticsPage: React.FC = () => {
    const [data, setData] = useState<DistrictStat[]>([]);
    const [ageStructure, setAgeStructure] = useState<AgeStructure | null>(null);
    const selectedDistrict = useDistrictFilterStore((s) => s.selectedDistrict);
    const setSelectedDistrict = useDistrictFilterStore((s) => s.setSelectedDistrict);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/analytics/district-stats/")
            .then((res) => res.json())
            .then((resData) => {
                const withScore = resData.map((d: DistrictStat) => ({
                    ...d,
                    score: d.population_per_clinic ?? Number.MAX_VALUE,
                }));
                setData(withScore);
            })
            .catch((err) => console.error("Ошибка при загрузке аналитики:", err));
    }, []);

    useEffect(() => {
        fetchAgeStructure(selectedDistrict)
            .then(setAgeStructure)
            .catch((err) => console.error("Ошибка при загрузке возрастной структуры:", err));
    }, [selectedDistrict]);

    const filteredData =
        selectedDistrict === "Все районы"
            ? data
            : data.filter((item) => item.district === selectedDistrict);

    const totalPopulation = filteredData.reduce((sum, d) => sum + d.population, 0);
    const districtOptions = Array.from(new Set(data.map((d) => d.district)));
    const sortedByScore = [...filteredData].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

    const exportToCSV = () => {
        const csv = Papa.unparse(
            filteredData.map(d => ({
                Район: d.district,
                Население: d.population,
                Клиники: d.clinic_count,
                "На 1 клинику": d.population_per_clinic,
                Индекс: d.score,
                Статус: d.status === "overloaded" ? "Перегружен" : "OK"
            }))
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "district_analytics.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="analytics-page">
            <h2>📊 Аналитика по районам</h2>

            <div className="dropdown-container">
                <label htmlFor="district-select">Выберите район:</label>
                <select
                    id="district-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                    <option value="Все районы">Все районы</option>
                    {districtOptions.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            <div className="chart-container">
                <h3>Население и Количество клиник</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={filteredData}>
                        <XAxis dataKey="district" />
                        <YAxis yAxisId="left" tickFormatter={(v) => v.toLocaleString()} />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip formatter={(value: number, name: string) =>
                            [value.toLocaleString(), name]
                        } />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="population"
                            name="Население"
                            fill="#8884d8"
                            radius={[6, 6, 0, 0]}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="clinic_count"
                            name="Клиники"
                            fill="#82ca9d"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>


            <div className="chart-container">
                <h3>🏥 Обеспеченность клиниками (меньше — лучше)</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={filteredData} barSize={36}>
                        <XAxis
                            dataKey="district"
                            tickLine={false}
                            axisLine={false}
                            style={{ fontSize: 14 }}
                        />
                        <YAxis
                            tickFormatter={(v) => v.toLocaleString()}
                            tickLine={false}
                            axisLine={false}
                            style={{ fontSize: 14 }}
                        />
                        <Tooltip
                            formatter={(value: number) => value.toLocaleString()}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
                                border: "none"
                            }}
                            labelStyle={{ fontWeight: "bold" }}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: 14,
                                paddingTop: 12
                            }}
                        />
                        <Bar
                            radius={[10, 10, 0, 0]}
                            dataKey="population_per_clinic"
                            name="Население на 1 клинику"
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.status === "overloaded"
                                            ? "#ff6b6b" // ярко-красный для перегруженных
                                            : "#4fc3f7" // стильный голубой для нормальных
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>


            <div className="chart-container">
                <h3>🥧 Доля населения по районам</h3>
                <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                        <Pie
                            data={filteredData}
                            dataKey="population"
                            nameKey="district"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            innerRadius={60}
                            paddingAngle={3}
                            labelLine={false}
                            label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(1)}%)`
                            }
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => `${value.toLocaleString()} чел.`}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                border: "none",
                                fontSize: "14px",
                            }}
                            labelStyle={{ fontWeight: "bold" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>


            <div className="chart-container">
                <h3>📊 Рейтинг по доступу к клиникам</h3>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
                    Ниже представлен рейтинг районов по количеству жителей на одну клинику. Меньше — лучше.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {sortedByScore.map((entry, index) => {
                        const percentage = (entry.score ?? 0) / (sortedByScore[sortedByScore.length - 1].score ?? 1) * 100;
                        const isOverloaded = entry.status === "overloaded";

                        return (
                            <div
                                key={entry.district}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12
                                }}
                            >
                                <div style={{ width: 28, textAlign: "right", fontWeight: 500 }}>{index + 1}.</div>
                                <div style={{ width: 160 }}>{entry.district}</div>
                                <div style={{ flex: 1, background: "#eee", height: 12, borderRadius: 999 }}>
                                    <div
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: isOverloaded ? "#f44336" : "#4caf50",
                                            height: "100%",
                                            borderRadius: 999,
                                            transition: "width 0.3s"
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: 100,
                                        textAlign: "right",
                                        fontSize: 13,
                                        color: "#333"
                                    }}
                                >
                                    {entry.score?.toLocaleString()} чел.
                                </div>
                                <div style={{ fontSize: 14 }}>
                                    {isOverloaded ? "🔴 Перегруз" : "🟢 Норма"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>





            {ageStructure && (
                <div className="chart-container">
                    <h3>👤 Возрастная структура населения</h3>
                    <div className="age-bar-list">
                        {[
                            { key: "f0_14", label: "0–14", color: "#ffcdd2" },
                            { key: "f15_25", label: "15–25", color: "#ffe082" },
                            { key: "f26_35", label: "26–35", color: "#fff176" },
                            { key: "f36_45", label: "36–45", color: "#aed581" },
                            { key: "f46_55", label: "46–55", color: "#4db6ac" },
                            { key: "f56_65", label: "56–65", color: "#4fc3f7" },
                            { key: "f66", label: "66+", color: "#9575cd" }
                        ].map((group) => {
                            const value = (ageStructure as any)[group.key] ?? 0;
                            const total = Object.values(ageStructure!).reduce((a, b) => a + (b || 0), 0);
                            const percent = (value / total) * 100;

                            return (
                                <div className="age-bar" key={group.key}>
                        <span className="age-label">
                            <span
                                className="age-dot"
                                style={{ backgroundColor: group.color }}
                            />
                            {group.label}
                        </span>
                                    <div className="age-progress">
                                        <div
                                            className="age-fill"
                                            style={{ width: `${percent}%`, backgroundColor: group.color }}
                                        />
                                    </div>
                                    <div className="age-count">{value.toLocaleString()} чел.</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ textAlign: "right", margin: "12px 0" }}>
                <button
                    onClick={exportToCSV}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#317ae2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    📥 Экспорт в CSV
                </button>
            </div>

            <div className="table-container">
                <h3>📋 Таблица</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Район</th>
                        <th>Население</th>
                        <th>Клиники</th>
                        <th>На 1 клинику</th>
                        <th>Индекс</th>
                        <th>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.map((row) => (
                        <tr key={row.district} className={row.status === "overloaded" ? "overloaded" : ""}>
                            <td>{row.district}</td>
                            <td>{row.population.toLocaleString()}</td>
                            <td>{row.clinic_count}</td>
                            <td>{row.population_per_clinic?.toLocaleString()}</td>
                            <td>{row.score?.toFixed(0)}</td>
                            <td>{row.status === "overloaded" ? "Перегружен" : "OK"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsPage;
