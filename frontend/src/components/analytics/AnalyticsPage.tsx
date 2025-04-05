import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./analyticsPage.css";

interface DistrictStat {
    district: string;
    population: number;
    clinic_count: number;
    population_per_clinic: number;
    status: string;
}

const AnalyticsPage: React.FC = () => {
    const [data, setData] = useState<DistrictStat[]>([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/analytics/district-stats/")
            .then((res) => res.json())
            .then(setData)
            .catch((err) => console.error("Ошибка при загрузке аналитики:", err));
    }, []);

    return (
        <div className="analytics-page">
            <h2>📊 Аналитика по районам</h2>

            <div className="chart-container">
                <h3>Население и Количество клиник</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis dataKey="district" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="population" fill="#8884d8" name="Население" />
                        <Bar dataKey="clinic_count" fill="#82ca9d" name="Клиники" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-container">
                <h3>Обеспеченность клиниками (меньше — лучше)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis dataKey="district" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="population_per_clinic" fill="#ffc658" name="Население на 1 клинику" />
                    </BarChart>
                </ResponsiveContainer>
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
                        <th>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row) => (
                        <tr key={row.district} className={row.status === "overloaded" ? "overloaded" : ""}>
                            <td>{row.district}</td>
                            <td>{row.population.toLocaleString()}</td>
                            <td>{row.clinic_count}</td>
                            <td>{row.population_per_clinic.toLocaleString()}</td>
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
