// src/components/Analysis.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import predictionService from '../../services/predictionService';
import styles from './Analysis.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Analysis = () => {
  const [containerId, setContainerId] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        console.log('Iniciando carga del modelo...');
        await predictionService.initialize();
        setModelLoading(false);
        console.log('Modelo LSTM cargado exitosamente');
      } catch (err) {
        console.error('Error al cargar modelo:', err);
        setError(`Error al cargar el modelo LSTM: ${err.message}`);
        setModelLoading(false);
      }
    };
    initModel();
  }, []);

  useEffect(() => {
    if (!modelLoading) {
      fetchHistory();
      fetchHistoricalData();
    }
  }, [containerId, modelLoading]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/predictions/history/${containerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setHistory(response.data.data);
    } catch (err) {
      console.error('Error al obtener historial:', err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/predictions/data/historical/${containerId}?limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setHistoricalData(response.data.data);
    } catch (err) {
      console.error('Error al obtener datos históricos:', err);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!predictionService.isReady) {
        throw new Error('El modelo aún no está cargado. Por favor espera unos segundos.');
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/predictions/data/historical/${containerId}?limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const datosHistoricos = response.data.data;
      console.log('Datos históricos recibidos:', datosHistoricos);

      if (!datosHistoricos || datosHistoricos.length < 12) {
        throw new Error(
          `Datos insuficientes. Se requieren al menos 12 lecturas. Recibidos: ${datosHistoricos?.length || 0}`
        );
      }

      const resultado = await predictionService.predict(datosHistoricos, containerId);
      setPrediction(resultado);

      await axios.post(
        `${API_URL}/predictions/save`,
        {
          id_contenedor: containerId,
          prediccion_peso: resultado.peso_predicho,
          delta_peso: resultado.delta_peso,
          peso_actual: resultado.peso_actual,
          confianza: resultado.confianza,
          modelo: `${resultado.metadatos.metodo_usado} (Híbrido)`,
          estado: resultado.interpretacion.estado,
          decision_auditable: resultado.interpretacion.decision,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchHistory();
    } catch (err) {
      console.error('Error en predicción:', err);
      setError(err.response?.data?.error || err.message || 'Error al realizar predicción');
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color) => {
    const map = {
      red: styles.predictionCardRed,
      green: styles.predictionCardGreen,
      orange: styles.predictionCardOrange,
    };
    return map[color] || styles.predictionCardGreen;
  };

  const getConfidenceColor = (confianza) => {
    if (confianza >= 80) return 'text-green-600';
    if (confianza >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDeltaColor = (delta) => {
    if (delta >= 0.2) return 'text-red-600';
    if (delta >= 0.05) return 'text-green-600';
    return 'text-orange-600';
  };

  const getConfidenceBarClass = (confianza) => {
    if (confianza >= 80) return styles.confidenceFillGreen;
    if (confianza >= 60) return styles.confidenceFillYellow;
    return styles.confidenceFillRed;
  };

  const getPrioridadBadgeClass = (prioridad) => {
    const map = {
      'URGENTE': 'bg-red-100 text-red-800 border-red-300',
      'ALTA': 'bg-orange-100 text-orange-800 border-orange-300',
      'MEDIA-ALTA': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'NORMAL': 'bg-green-100 text-green-800 border-green-300',
      'BAJA': 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return map[prioridad] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const chartData = historicalData.slice(-20).map((item, idx) => ({
    index: idx + 1,
    peso: item.peso,
    nivel: item.nivel,
    timestamp: new Date(item.timestamp).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  const historyChartData = history.slice(-10).map((item, idx) => ({
    index: idx + 1,
    prediccion: item.prediccion_peso,
    confianza: item.confianza || 0,
    fecha: new Date(item.timestamp_registro).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  if (modelLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className={styles.spinner}></div>
          <p className="text-lg font-medium">Cargando modelo LSTM...</p>
          <p className="text-sm text-gray-500 mt-2">Esto puede tardar unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="mb-8">
        <h1 className={styles.title}>Predicciones - Sistema Híbrido</h1>
        <p className="text-sm text-gray-600 mt-2">
          🤖 Combina LSTM con reglas heurísticas para predicciones más confiables
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.selectorContainer}>
          <div>
            <label className={styles.label}>Seleccionar Contenedor:</label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(parseInt(e.target.value))}
              className={styles.select}
            >
              <option value={1}>Contenedor 1</option>
              <option value={2}>Contenedor 2</option>
              <option value={3}>Contenedor 3</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || !predictionService.isReady}
            className={styles.predictButton}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Prediciendo...
              </span>
            ) : (
              'Generar Predicción'
            )}
          </button>

          <div className="w-full mt-4">
            {predictionService.isReady ? (
              <div className={styles.modelStatusReady}>✅ Sistema híbrido listo</div>
            ) : (
              <div className={styles.modelStatusLoading}>⏳ Inicializando...</div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <p className="font-medium">⚠️ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {prediction && (
        <div className={`${styles.predictionSection} ${getColorClass(prediction.interpretacion?.color)}`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">🔮 Última Predicción</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getPrioridadBadgeClass(prediction.interpretacion?.prioridad)}`}>
              {prediction.interpretacion?.prioridad}
            </span>
          </div>

          {/* Método usado */}
          <div className="mb-6 p-4 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-75">Método:</span>
              <span className="text-lg font-bold">
                {prediction.metadatos?.metodo_usado === 'LSTM' ? '🤖 LSTM' : '📊 Heurística (Regresión Lineal)'}
              </span>
            </div>
            {prediction.metadatos?.detalle_modelo?.razon_heuristica && (
              <p className="text-xs mt-1 opacity-75">
                Razón: {prediction.metadatos.detalle_modelo.razon_heuristica}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={styles.infoCard}>
              <p className="text-sm font-medium opacity-75 mb-1">Peso Actual</p>
              <p className="text-2xl font-bold text-gray-700">{prediction.peso_actual?.toFixed(4)} kg</p>
              <p className="text-xs opacity-75 mt-1">Nivel: {prediction.nivel_actual?.toFixed(1)}%</p>
            </div>

            <div className={styles.infoCard}>
              <p className="text-sm font-medium opacity-75 mb-1">Incremento Predicho</p>
              <p className={`text-4xl font-bold ${getDeltaColor(prediction.delta_peso)}`}>
                +{prediction.delta_peso?.toFixed(4)} kg
              </p>
              {prediction.metadatos?.detalle_modelo?.tasa_crecimiento && (
                <p className="text-xs opacity-75 mt-1">
                  Tasa: {prediction.metadatos.detalle_modelo.tasa_crecimiento.toFixed(4)} kg/h
                </p>
              )}
            </div>

            <div className={styles.infoCard}>
              <p className="text-sm font-medium opacity-75 mb-1">Peso Futuro Estimado</p>
              <p className="text-3xl font-bold">{prediction.peso_predicho?.toFixed(4)} kg</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={styles.infoCard}>
              <p className="text-sm font-medium opacity-75 mb-1">Confianza del Sistema</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${getConfidenceColor(prediction.confianza)}`}>
                  {prediction.confianza?.toFixed(1)}%
                </p>
                <span className="text-sm opacity-75">({prediction.metadatos?.calidad_datos})</span>
              </div>
              <div className={styles.confidenceBar}>
                <div
                  className={getConfidenceBarClass(prediction.confianza)}
                  style={{ width: `${prediction.confianza}%` }}
                />
              </div>
            </div>

            <div className={styles.infoCard}>
              <p className="text-sm font-medium opacity-75 mb-1">Timestamp</p>
              <p className="text-lg">{new Date(prediction.timestamp).toLocaleString('es-MX')}</p>
              <p className="text-xs opacity-75 mt-1">{prediction.metadatos?.muestras_usadas} muestras</p>
            </div>
          </div>

          <div className={`${styles.infoCard} mb-4`}>
            <p className="text-sm font-medium opacity-75 mb-1">Estado</p>
            <p className="text-xl font-semibold">{prediction.interpretacion?.estado}</p>
          </div>

          <div className={styles.infoCard}>
            <p className="text-sm font-medium opacity-75 mb-1">Decisión Recomendada</p>
            <p className="text-lg">{prediction.interpretacion?.decision}</p>
          </div>

          {/* Detalles técnicos (colapsable) */}
          {prediction.metadatos?.detalle_modelo && (
            <details className="mt-4 p-4 bg-white bg-opacity-30 rounded-lg">
              <summary className="cursor-pointer font-medium text-sm opacity-75">
                🔧 Detalles Técnicos
              </summary>
              <div className="mt-3 text-xs font-mono space-y-1 opacity-75">
                {prediction.metadatos.detalle_modelo.output_raw !== undefined && (
                  <p>LSTM Output (normalizado): {prediction.metadatos.detalle_modelo.output_raw.toFixed(4)}</p>
                )}
                {prediction.metadatos.detalle_modelo.output_denorm !== undefined && (
                  <p>LSTM Output (denormalizado): {prediction.metadatos.detalle_modelo.output_denorm.toFixed(4)} kg</p>
                )}
                {prediction.metadatos.detalle_modelo.delta_calculado !== undefined && (
                  <p>Delta calculado por LSTM: {prediction.metadatos.detalle_modelo.delta_calculado.toFixed(4)} kg</p>
                )}
                {prediction.metadatos.detalle_modelo.delta_ajustado && (
                  <p className="text-orange-600">⚠️ Delta ajustado por contenedor lleno</p>
                )}
              </div>
            </details>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={styles.card}>
          <h3 className={styles.chartTitle}>📈 Datos Históricos</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="peso" stroke="#3b82f6" name="Peso (kg)" strokeWidth={2} />
                <Line type="monotone" dataKey="nivel" stroke="#10b981" name="Nivel (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.emptyState}>No hay datos</p>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.chartTitle}>🎯 Historial Predicciones</h3>
          {historyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prediccion" fill="#8b5cf6" name="Predicción (kg)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.emptyState}>No hay predicciones</p>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className="text-xl font-bold mb-4">📜 Historial Detallado</h2>
        {history.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay predicciones para este contenedor</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Fecha</th>
                  <th className={styles.tableHeader}>Peso (kg)</th>
                  <th className={styles.tableHeader}>Confianza</th>
                  <th className={styles.tableHeader}>Estado</th>
                  <th className={styles.tableHeader}>Decisión</th>
                  <th className={styles.tableHeader}>Método</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      {new Date(item.timestamp_registro).toLocaleString('es-MX')}
                    </td>
                    <td className={`${styles.tableCell} font-mono font-medium`}>
                      {item.prediccion_peso?.toFixed(4)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`font-semibold ${getConfidenceColor(item.confianza || 0)}`}>
                        {item.confianza ? `${item.confianza.toFixed(1)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.statusBadge}>{item.estado}</span>
                    </td>
                    <td className={styles.tableCell}>{item.decision_auditable}</td>
                    <td className={styles.tableCell}>
                      <span className="text-xs opacity-75">{item.modelo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;