import { useState, useEffect } from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,} from 'recharts';
import predictionService from '../../services/predictionService';
import {contenedoresService} from '../../services/contenedoresService';
import styles from './Analysis.module.css';
import { analysisService } from '../../services/analysisService';

const THEME_COLORS = {
  navy: '#14447C',
  green: '#629460',
  grid: '#e2e8f0',
  text: '#64748b',
  tooltipBg: '#ffffff',
  tooltipShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const Analysis = () => {
  const [containerId, setContainerId] = useState(1);
  const [contenedores, setContenedores] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContenedores = async () => {
      try {
        const response = await contenedoresService.getAll();
        const listaContenedores = response.data || [];
        setContenedores(listaContenedores);

        if (listaContenedores.length > 0) {
          setContainerId(listaContenedores[0].id_contenedor);
        }
      } catch (err) {
        console.error('Error cargando lista de contenedores:', err);
      }
    };
    loadContenedores();
  }, []);

  useEffect(() => {
    const initModel = async () => {
      try {
        await predictionService.initialize();
        setModelLoading(false);
      } catch (err) {
        console.error('Error al cargar modelo:', err);
        setError(`Error al cargar el modelo LSTM: ${err.message}`);
        setModelLoading(false);
      }
    };
    initModel();
  }, []);

  useEffect(() => {
if (!modelLoading && containerId) {
      setPrediction(null);
      setHistory([]);
      setHistoricalData([]);
      setError(null);

      fetchHistory();
      fetchHistoricalData();
    }
  }, [containerId, modelLoading]);

  const fetchHistory = async () => {
      try {
        const response = await analysisService.getHistory(containerId);
        
        if (response.success) {
          const historial = response.data || [];
          setHistory(historial);

          if (historial.length > 0) {
            const ultimo = historial[0]; 

            const prediccionRecuperada = {
              peso_actual: Number(ultimo.peso_actual),
              peso_predicho: Number(ultimo.prediccion_peso),
              delta_peso: Number(ultimo.delta_peso),
              confianza: Number(ultimo.confianza),
              
              nivel_actual: ultimo.nivel_actual || 0, 
              fecha_prediccion: ultimo.fecha_prediccion || null,

              interpretacion: {
                decision: ultimo.decision_auditable,
                estado: ultimo.estado,
                prioridad: inferirPrioridad(ultimo.estado),
                color: inferirColor(ultimo.estado)
              },
              
              metadatos: {
                calidad_datos: 'Registro Histórico',
                metodo_usado: ultimo.modelo 
              }
            };

            setPrediction(prediccionRecuperada);
          }
        }
      } catch (err) {
        console.error('Error al obtener historial:', err);
      }
    };

  const inferirPrioridad = (estado) => {
    if (!estado) return 'NORMAL';
    if (estado.includes('LLENO')) return 'URGENTE';
    if (estado.includes('CASI')) return 'ALTA';
    if (estado.includes('Alto')) return 'MEDIA-ALTA';
    return 'NORMAL';
  };

  const inferirColor = (estado) => {
    if (!estado) return 'green';
    if (estado.includes('LLENO') || estado.includes('Alto')) return 'red';
    if (estado.includes('CASI') || estado.includes('Bajo')) return 'orange';
    return 'green';
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await analysisService.getHistoricalData(containerId); 
      if (response.success) setHistoricalData(response.data); 
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

      const response = await analysisService.getHistoricalData(containerId, 20); 
      const datosHistoricos = response.data; 

      if (!datosHistoricos || datosHistoricos.length < 12) { 
        throw new Error('No hay suficientes datos históricos para realizar una predicción.');
      }

      const resultado = await predictionService.predict(datosHistoricos, containerId); 
      setPrediction(resultado); 

      await analysisService.savePrediction({ 
        id_contenedor: containerId,
        prediccion_peso: resultado.peso_predicho, 
        delta_peso: resultado.delta_peso, 
        peso_actual: resultado.peso_actual, 
        confianza: resultado.confianza,
        estado: resultado.interpretacion.estado, 
        decision_auditable: resultado.interpretacion.decision,
      }); 
      fetchHistory(); 
    } catch (err) { 
      console.error('Error al generar predicción:', err);
      setError(`Error al generar predicción: ${err.message}`);
    } finally { 
      setLoading(false); 
    }
  };

  const getBorderColorClass = (color) => {
    const map = {
      red: styles.borderRed,
      green: styles.borderGreen,
      orange: styles.borderOrange,
    };
    return map[color] || styles.borderGreen;
  };

  const getConfidenceTextColor = (confianza) => {
    if (confianza >= 80) return styles.textSuccess;
    if (confianza >= 60) return styles.textWarning;
    return styles.textDanger;
  };

  const getDeltaTextColor = (delta) => {
    if (delta >= 0.2) return styles.textDanger;
    if (delta >= 0.05) return styles.textSuccess;
    return styles.textWarning;
  };

  const getConfidenceBarClass = (confianza) => {
    if (confianza >= 80) return styles.bgSuccess;
    if (confianza >= 60) return styles.bgWarning;
    return styles.bgDanger;
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

  if (modelLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Inicializando Sistema</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>
          Predicciones y Análisis 
        </h2>

      <div className={styles.selectorContainer}>
        <div className={styles.inputWrapper}>
            <label className={styles.selectorLabel}>Contenedor:</label>
            <select
              value={containerId || ''}
              onChange={(e) => setContainerId(Number(e.target.value))}
              className={styles.select}
              disabled={contenedores.length === 0}
            >
              {contenedores.length === 0 && <option>Cargando...</option>}

              {contenedores.map((cont) => (
                <option key={cont.id_contenedor} value={cont.id_contenedor}>
                  {cont.nombre} {cont.ubicacion ? `- ${cont.ubicacion}` : ''}
                </option>
              ))}
            </select>
      </div>

          <button
            onClick={handlePredict}
            disabled={loading || !predictionService.isReady}
            className={styles.predictButton}
          >
            {loading ? (
              <>Calculando...</>
            ) : (
              <>
                Generar Predicción
              </>
            )}
          </button>
      </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <p className={styles.errorTitle}>Error del Sistema</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      )}

      {prediction && (
        <div className={`${styles.predictionSection} ${getBorderColorClass(prediction.interpretacion?.color)}`}>
          <div className={styles.predictionHeader}>
            <h2 className={styles.predictionTitle}>Resultado del Análisis</h2>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <p className={styles.infoLabel}>Peso Actual</p>
              <p className={styles.infoValueBig}>
                {prediction.peso_actual?.toFixed(4)} <span className={styles.unitText}>kg</span>
              </p>
              <p className={styles.subValueText}>Nivel: {prediction.nivel_actual?.toFixed(1)}%</p>
            </div>

            <div className={styles.infoCard}>
              <p className={styles.infoLabel}>Incremento Estimado</p>
              <p className={`${styles.infoValueBig} ${getDeltaTextColor(prediction.delta_peso)}`}>
                +{prediction.delta_peso?.toFixed(4)} <span className={styles.unitText}>kg</span>
              </p>
              {prediction.metadatos?.detalle_modelo?.tasa_crecimiento && (
                <p className={styles.subValueText}>
                  Tasa: {prediction.metadatos.detalle_modelo.tasa_crecimiento.toFixed(4)} kg/h
                </p>
              )}
            </div>

            <div className={styles.infoCard}>
              <p className={styles.infoLabel}>Peso Futuro (Predicho)</p>
              <p className={`${styles.infoValueBig} ${styles.textNavy}`}>
                {prediction.peso_predicho?.toFixed(4)} <span className={styles.unitText}>kg</span>
              </p>
              <p className={styles.subValueText}>
                Estimado para:
              </p>
              <p className={styles.dateText}>
                {new Date(prediction.fecha_prediccion).toLocaleString('es-MX', {
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className={styles.infoCard}>
              <p className={styles.infoLabel}>Confianza del Modelo</p>
              <div className={styles.confidenceWrapper}>
                <p className={`${styles.infoValueBig} ${getConfidenceTextColor(prediction.confianza)}`}>
                  {prediction.confianza?.toFixed(1)}%
                </p>
                <span className={styles.subValueText}>({prediction.metadatos?.calidad_datos})</span>
              </div>
              <div className={styles.confidenceBarBg}>
                <div
                  className={`${styles.confidenceFill} ${getConfidenceBarClass(prediction.confianza)}`}
                  style={{ width: `${prediction.confianza}%` }}
                />
              </div>
            </div>
          </div>

          <div className={styles.decisionBox}>
              <p className={styles.decisionLabel}>Decisión Recomendada</p>
              <p className={styles.decisionValue}>{prediction.interpretacion?.decision}</p>
          </div>
        </div>
      )}

      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <h3 className={styles.chartTitle}>Tendencia de Datos</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke={THEME_COLORS.text} 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke={THEME_COLORS.text} 
                  fontSize={12} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: THEME_COLORS.tooltipShadow 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke={THEME_COLORS.navy} 
                  name="Peso (kg)" 
                  strokeWidth={3} 
                  dot={{ r: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="nivel" 
                  stroke={THEME_COLORS.green} 
                  name="Nivel (%)" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.emptyChart}>No hay datos suficientes para graficar</p>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          Registro
        </h2>
        {history.length === 0 ? (
          <div className={styles.emptyChart}>
            <p>No hay registros disponibles para este contenedor</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>Fecha</th>
                  <th className={styles.tableHeader}>Peso (kg)</th>
                  <th className={styles.tableHeader}>Confianza</th>
                  <th className={styles.tableHeader}>Estado</th>
                  <th className={styles.tableHeader}>Decisión</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      {new Date(item.timestamp_registro).toLocaleString('es-MX')}
                    </td>
                    <td className={`${styles.tableCell} ${styles.cellMono}`}>
                      {item.prediccion_peso?.toFixed(4)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.cellBold} ${item.confianza >= 80 ? styles.textSuccess : styles.textWarning}`}>
                        {item.confianza ? `${item.confianza.toFixed(1)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{item.decision_auditable}</td>
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