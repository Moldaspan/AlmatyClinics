import React from "react";
import { Hospital } from "../../types/Hospital";

interface Props {
    topHospitals: (Hospital & {
        distance: string;
        population: number;
    })[];
    onRouteClick: (hospital: Hospital) => void;
}

const TopHospitalsPanel: React.FC<Props> = ({ topHospitals, onRouteClick }) => {
    return (
        <>
            <h3>🏥 Топ 5 ближайших больниц</h3>
            {topHospitals.map((h, i) => (
                <div key={h.id} className="hospital-card" style={{ borderColor: "#0078be" }}>
                    <div><b>{i + 1}. {h.name}</b></div>
                    <div>📍 {h.distance} км</div>
                    <div>👥 Население поблизости: {h.population}</div>
                    <button
                        style={{ marginTop: "5px" }}
                        onClick={() => onRouteClick(h)}
                    >
                        Проложить маршрут
                    </button>
                </div>
            ))}
        </>
    );
};

export default TopHospitalsPanel;
