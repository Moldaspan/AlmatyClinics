import { create } from "zustand";

interface DistrictFilterState {
    selectedDistrict: string;
    setSelectedDistrict: (district: string) => void;
}

export const useDistrictFilterStore = create<DistrictFilterState>((set) => ({
    selectedDistrict: "Все районы",
    setSelectedDistrict: (district) => set({ selectedDistrict: district }),
}));
