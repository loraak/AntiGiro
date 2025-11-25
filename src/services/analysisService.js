import { apiClient } from './apiClient';

export const analysisService = {
    getHistory: async (containerId) => {
        return await apiClient(`/predictions/history/${containerId}`, {
            method: 'GET'
        });
    },

    getHistoricalData: async (containerId, limit = 50) => {
        return await apiClient(`/predictions/data/historical/${containerId}?limit=${limit}`, {
            method: 'GET'
        });
    },

    savePrediction: async (predictionData) => {
        return await apiClient('/predictions/save', {
            method: 'POST',
            body: JSON.stringify(predictionData)
        });
    }
};