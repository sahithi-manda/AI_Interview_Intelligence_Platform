import { useContext } from "react";
import { PreparationContext } from "../context/PreparationContextDefinition";

export const usePreparation = () => {
    const context = useContext(PreparationContext);
    if (!context) {
        throw new Error("usePreparation must be used within a PreparationProvider");
    }
    return context;
};
