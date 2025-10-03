import { useState, useEffect } from 'react';
import { Package, AlertCircle, Clock, Droplets, Bell, Activity, Radio, Magnet } from 'lucide-react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import styles from "./Configuration.module.css";

const Configuration = () => {
    const [containers, setContainers] = useState([
        {
            id: 'ESP32',
            name: 'Bolsa de Residuos',
            type: 'Residuos Punzocortantes',
            location: 'Incubadora La Esperanza',
            capacity: 5,
            weight: 1.2,
            distance: 15,
            maxDistance: 45,
            doorOpen: false,
            lastUpdate: Date.now(),
            history: []
        },
    ]);
    const [config, setConfig] = useState({
    pesoMaximo: 1,
    nivelLlenado: 75,
    tiempoApertura: 5,
    sensibilidad: 50
});

  const [saved, setSaved] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [reportData, setReportData] = useState([]);

  const handleChange = (param, value) => {
    setConfig(prev => ({ ...prev, [param]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConfig({
      pesoMaximo: 50,
      nivelLlenado: 75,
      tiempoApertura: 5,
      sensibilidad: 50
    });
    setSaved(false);
  };

  // Sistema de alertas
  useEffect(() => {
      const newAlerts = [];
      containers.forEach(container => {
          const percentage = (container.weight / container.capacity) * 100;
          const distancePercentage = ((container.maxDistance - container.distance) / container.maxDistance) * 100;

          if (percentage >= 95) {
              newAlerts.push({
                  id: `${container.id}-critical`,
                  level: 'critical',
                  container: container.name,
                  message: 'Capacidad crítica alcanzada - Recolección inmediata requerida',
                  time: new Date().toLocaleTimeString('es-MX')
              });
          } else if (percentage >= 85) {
              newAlerts.push({
                  id: `${container.id}-warning`,
                  level: 'warning',
                  container: container.name,
                  message: 'Nivel alto - Programar recolección pronto',
                  time: new Date().toLocaleTimeString('es-MX')
              });
          }

          if (distancePercentage >= 90) {
              newAlerts.push({
                  id: `${container.id}-distance`,
                  level: 'critical',
                  container: container.name,
                  message: 'Sensor de distancia: Contenedor casi lleno',
                  time: new Date().toLocaleTimeString('es-MX')
              });
          }

          if (container.doorOpen) {
              newAlerts.push({
                  id: `${container.id}-door`,
                  level: 'warning',
                  container: container.name,
                  message: 'Sensor magnético: Puerta abierta',
                  time: new Date().toLocaleTimeString('es-MX')
              });
          }
      });
      setAlerts(newAlerts);
  }, [containers]);

  // Generar datos de reporte
  useEffect(() => {
      const data = containers.map(c => ({
          name: c.name.split(' ').slice(-1)[0],
          peso: parseFloat(c.weight.toFixed(1)),
          capacidad: parseFloat(((c.weight / c.capacity) * 100).toFixed(1)),
          distancia: parseFloat(c.distance.toFixed(1))
      }));
      setReportData(data);
  }, [containers]);

  const calculatePercentage = (weight, capacity) => {
      return (weight / capacity) * 100;
  };

  const getStatus = (percentage) => {
      if (percentage >= 95) return 'critical';
      if (percentage >= 85) return 'warning';
      return 'normal';
  };

  const getStatusText = (status) => {
      const statusMap = {
          critical: 'Crítico',
          warning: 'Advertencia',
          normal: 'Normal'
      };
      return statusMap[status];
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
              <h1 className={styles.title}>
                Monitoreo del Prototipo
              </h1>

        {/* Alertas Section */}
        {alerts.length > 0 && (
          <div className={styles.alertsSection}>
            <h2 className={styles.alertsTitle}>
              Alertas del Sistema
            </h2>
            <div className={styles.alertsList}>
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`${styles.alertItem} ${
                    alert.level === 'critical' ? styles.alertItemCritical : styles.alertItemWarning
                  }`}
                >
                  <div className={styles.alertContent}>
                    <AlertCircle size={20} color={alert.level === 'critical' ? '#ef4444' : '#f59e0b'} />
                    <div>
                      <p className={styles.alertContainer}>{alert.container}</p>
                      <p className={styles.alertMessage}>{alert.message}</p>
                    </div>
                  </div>
                  <span className={styles.alertTime}>{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel de Contenedores */}
        <div className={styles.containersGrid}>
          {containers.map(container => {
            const percentage = calculatePercentage(container.weight, container.capacity);
            const status = getStatus(percentage);

            return (
              <div key={container.id} className={styles.containerCard}>
                <div className={styles.containerHeader}>
                  <div>
                    <h3 className={styles.containerName}>{container.name}</h3>
                    <p className={styles.containerId}>{container.id}</p>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      status === 'critical'
                        ? styles.statusCritical
                        : status === 'warning'
                        ? styles.statusWarning
                        : styles.statusNormal
                    }`}
                  >
                    {getStatusText(status)}
                  </span>
                </div>

                <div className={styles.containerContent}>
                  {/* Sensores IoT */}
                  <div className={styles.sensorsGrid}>
                    <div className={`${styles.sensorCard} ${styles.sensorCardBlue}`}>
                      <div className={styles.sensorHeader}>
                        <Package size={24} />
                        <p className={styles.sensorLabel}>Peso Total</p>
                      </div>
                      <p className={styles.sensorValue}>{container.weight.toFixed(2)} kg</p>
                      <p className={styles.sensorSubtext}>de {container.capacity} kg máx.</p>
                    </div>

                    <div className={`${styles.sensorCard} ${styles.sensorCardYellow}`}>
                      <div className={styles.sensorHeader}>
                        <Droplets size={24} />
                        <p className={styles.sensorLabel}>Capacidad</p>
                      </div>
                      <p className={styles.sensorValue}>
                        {calculatePercentage(container.weight, container.capacity).toFixed(1)}%
                      </p>
                      <p className={styles.sensorSubtext}>Nivel de llenado</p>
                    </div>

                    <div className={`${styles.sensorCard} ${styles.sensorCardRed}`}>
                      <div className={styles.sensorHeader}>
                        <Clock size={24} />
                        <p className={styles.sensorLabel}>Última Act.</p>
                      </div>
                      <p className={styles.sensorValue}>
                        {Math.floor((Date.now() - container.lastUpdate) / 60000)}m
                      </p>
                      <p className={styles.sensorSubtext}>hace minutos</p>
                    </div>

                    <div className={`${styles.sensorCard} ${styles.sensorCardGreen}`}>
                      <div className={styles.sensorHeader}>
                        <Radio size={24} />
                        <p className={styles.sensorLabel}>Distancia</p>
                      </div>
                      <p className={styles.sensorValue}>{container.distance.toFixed(1)} cm</p>
                      <p className={styles.sensorSubtext}>Sensor ultrasónico</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Llenado</span>
                      <span className={styles.progressValue}>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          status === 'critical'
                            ? styles.progressFillCritical
                            : status === 'warning'
                            ? styles.progressFillWarning
                            : styles.progressFillNormal
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.weightInfo}>
                    <div>
                      <p className={styles.weightLabel}>Peso Actual</p>
                      <p className={styles.weightValue}>{container.weight.toFixed(1)} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel Detallado */}
        <div>
          {containers.map(container => {
            return (
              <div key={container.id} className={styles.detailPanel}>
                <h2 className={styles.detailTitle}>Detalles: {container.name}</h2>

                {/* Información Adicional y Sensores en una fila */}
                <div className={styles.detailGrid}>
                  {/* Información del Residuo */}
                  <div className={styles.infoBox}>
                    <h4 className={styles.infoTitle}>Información del Residuo</h4>
                    <div className={styles.infoList}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Tipo:</span>
                        <span className={styles.infoValue}>{container.type}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Ubicación:</span>
                        <span className={styles.infoValue}>{container.location}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>ID Dispositivo:</span>
                        <span className={styles.infoValue}>{container.id}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Estado Puerta:</span>
                        <span
                          className={`${styles.doorStatus} ${
                            container.doorOpen ? styles.doorOpen : styles.doorClosed
                          }`}
                        >
                          <Magnet size={14} />
                          {container.doorOpen ? 'ABIERTA' : 'CERRADA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado de Sensores IoT */}
                  <div className={styles.sensorsBox}>
                    <h4 className={styles.sensorsTitle}>
                      <Activity size={20} />
                      Estado de Sensores IoT
                    </h4>
                    <div className={styles.sensorsDetailGrid}>
                      <div className={styles.sensorDetailCard}>
                        <div className={styles.sensorDetailHeader}>
                          <Activity size={18} color="#14447C" />
                          <span className={styles.sensorDetailName}>Sensor de Peso</span>
                        </div>
                        <p className={`${styles.sensorDetailValue} ${styles.sensorDetailValuePurple}`}>
                          {container.weight.toFixed(2)} kg
                        </p>
                        <p className={styles.sensorDetailInfo}>
                          Celda de carga • Actualización: {Math.floor((Date.now() - container.lastUpdate) / 1000)}s
                        </p>
                        <div className={`${styles.sensorDetailStatus} ${styles.sensorStatusActive}`}>
                          <span className={styles.sensorStatusActiveText}>● ACTIVO</span>
                        </div>
                      </div>

                      <div className={styles.sensorDetailCard}>
                        <div className={styles.sensorDetailHeader}>
                          <Radio size={18} color="#D6D135" />
                          <span className={styles.sensorDetailName}>Sensor Ultrasónico</span>
                        </div>
                        <p className={`${styles.sensorDetailValue} ${styles.sensorDetailValueViolet}`}>
                          {container.distance.toFixed(1)} cm
                        </p>
                        <p className={styles.sensorDetailInfo}>
                          HC-SR04 • Rango: 0-{container.maxDistance}cm
                        </p>
                        <div className={`${styles.sensorDetailStatus} ${styles.sensorStatusPurple}`}>
                          <span className={styles.sensorStatusPurpleText}>● ACTIVO</span>
                        </div>
                      </div>

                      <div className={styles.sensorDetailCard}>
                        <div className={styles.sensorDetailHeader}>
                          <Magnet size={18} color={container.doorOpen ? '#ef4444' : '#00AD4B'} />
                          <span className={styles.sensorDetailName}>Sensor Magnético</span>
                        </div>
                        <p
                          className={`${styles.sensorDetailValue} ${
                            container.doorOpen ? styles.sensorDetailValueRed : styles.sensorDetailValueGreen
                          }`}
                        >
                          {container.doorOpen ? 'ABIERTA' : 'CERRADA'}
                        </p>
                        <p className={styles.sensorDetailInfo}>Reed Switch • Estado de puerta</p>
                        <div
                          className={`${styles.sensorDetailStatus} ${
                            container.doorOpen ? styles.sensorStatusAlert : styles.sensorStatusNormal
                          }`}
                        >
                          <span
                            className={
                              container.doorOpen ? styles.sensorStatusAlertText : styles.sensorStatusNormalText
                            }
                          >
                            ● {container.doorOpen ? 'ALERTA' : 'NORMAL'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Configuración IoT</h1>
        </div>

        <div className={styles.controls}>
          {/* Peso Máximo */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              <span>Peso Máximo</span>
              <span className={styles.value}>{config.pesoMaximo} kg</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={config.pesoMaximo}
              onChange={(e) => handleChange('pesoMaximo', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.range}>
              <span>1 kg</span>
              <span>20 kg</span>
            </div>
          </div>

          {/* Nivel de Llenado */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              <span>Nivel de Llenado</span>
              <span className={styles.value}>{config.nivelLlenado}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.nivelLlenado}
              onChange={(e) => handleChange('nivelLlenado', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.range}>
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Tiempo de Apertura */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              <span>Tiempo de Apertura</span>
              <span className={styles.value}>{config.tiempoApertura} seg</span>
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={config.tiempoApertura}
              onChange={(e) => handleChange('tiempoApertura', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.range}>
              <span>1 seg</span>
              <span>15 seg</span>
            </div>
          </div>

          {/* Sensibilidad de Sensores */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              <span>Sensibilidad de Sensores</span>
              <span className={styles.value}>
                {config.sensibilidad < 4 ? 'Baja' : config.sensibilidad < 7 ? 'Media' : 'Alta'}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="9"
              value={config.sensibilidad}
              onChange={(e) => handleChange('sensibilidad', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.range}>
              <span>Baja</span>
              <span>Media</span>
              <span>Alta</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className={styles.buttons}>
          <button onClick={handleSave} className={styles.saveButton}>
            <Save className={styles.buttonIcon} />
            Guardar
          </button>
          <button onClick={handleReset} className={styles.resetButton}>
            <RotateCcw className={styles.buttonIcon} />
            Restablecer
          </button>
        </div>

        {/* Mensaje de guardado */}
        {saved && (
          <div className={styles.successMessage}>
            ✓ Configuración guardada correctamente
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuration;