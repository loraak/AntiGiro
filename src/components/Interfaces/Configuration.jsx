import { useState, useEffect } from 'react';
import { Package, AlertCircle, Clock, Droplets, Activity, Magnet, Settings, Save, RotateCcw, Plus } from 'lucide-react';
import styles from "./Configuration.module.css";
import { useLecturas } from '../../hooks/useLecturas';
import { contenedoresService } from '../../services/contenedoresService';
import AddContenedor from '../Interfaces/Admin/AddContenedor';

const Configuration = () => {
    const [selectedContenedorId, setSelectedContenedorId] = useState(1);
    const [contenedores, setContenedores] = useState([]);
    const [selectedContenedor, setSelectedContenedor] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loadingContenedores, setLoadingContenedores] = useState(true);
    
    const { lectura, isLoading, error, lastUpdate, refetch } = useLecturas(selectedContenedorId, 5);

    const [config, setConfig] = useState({
        pesoMaximo: 5,
        nivelLlenado: 80,
        tiempoApertura: 5,
        sensibilidad: 50
    });

    const [saved, setSaved] = useState(false);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        loadContenedores();
    }, []);

    useEffect(() => {
        if (contenedores.length > 0 && selectedContenedorId) {
            loadContenedorDetails(selectedContenedorId);
        }
    }, [contenedores, selectedContenedorId]);

    const loadContenedores = async () => {
        try {
            setLoadingContenedores(true);
            const response = await contenedoresService.getAll();
            setContenedores(response.data || []);
            
            if (response.data && response.data.length > 0 && !selectedContenedorId) {
                setSelectedContenedorId(response.data[0].id_contenedor);
            }
        } catch (err) {
            console.error('Error cargando contenedores:', err);
        } finally {
            setLoadingContenedores(false);
        }
    };

    const loadContenedorDetails = (id) => {
        try {
            const contenedor = contenedores.find(c => c.id_contenedor === id);
            
            if (contenedor) {
                setSelectedContenedor(contenedor);
                setConfig(prev => ({
                    ...prev,
                    pesoMaximo: Number(contenedor.peso_maximo) || 5,
                    nivelLlenado: Number(contenedor.nivel_alerta) || 80
                }));
            }
        } catch (err) {
            console.error('Error cargando detalles del contenedor:', err);
        }
    };

    const handleContenedorAdded = () => {
        loadContenedores();
        setIsAddModalOpen(false);
    };

    const container = lectura ? {
        id: `CONT-${lectura.id_contenedor}`,
        name: selectedContenedor?.nombre || 'Contenedor de Residuos',
        type: 'Residuos Punzocortantes',
        location: selectedContenedor?.ubicacion || 'Incubadora La Esperanza',
        capacity: config.pesoMaximo,
        weight: lectura.peso,
        lastUpdate: new Date(lectura.timestamp).getTime(),
        nivel: lectura.nivel,
        doorOpen: !lectura.estado_electroiman,
        alerta: lectura.alerta
    } : null;

    const handleChange = (param, value) => {
        setConfig(prev => ({ ...prev, [param]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            if (!selectedContenedorId || !selectedContenedor) {
                alert('No hay contenedor seleccionado');
                return;
            }

            const updatedData = {
                nombre: selectedContenedor.nombre,
                ubicacion: selectedContenedor.ubicacion,
                peso_maximo: config.pesoMaximo,
                nivel_alerta: config.nivelLlenado,
                activo: selectedContenedor.activo ?? 1,
                id_usuario: selectedContenedor.id_usuario
            };

            console.log('Guardando configuración:', updatedData);
            
            const response = await contenedoresService.update(selectedContenedorId, updatedData);
            
            console.log('Respuesta del servidor:', response);
            
            setSelectedContenedor(prev => ({
                ...prev,
                peso_maximo: config.pesoMaximo,
                nivel_alerta: config.nivelLlenado
            }));
            
            await loadContenedores();
            
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Error guardando configuración:', err);
            alert(`Error al guardar la configuración: ${err.message || 'Error desconocido'}`);
        }
    };

    const handleReset = () => {
        if (selectedContenedor) {
            setConfig(prev => ({
                ...prev,
                pesoMaximo: Number(selectedContenedor.peso_maximo) || 5,
                nivelLlenado: Number(selectedContenedor.nivel_alerta) || 80
            }));
        } else {
            setConfig({
                pesoMaximo: 5,
                nivelLlenado: 80,
                tiempoApertura: 5,
                sensibilidad: 50
            });
        }
        setSaved(false);
    };

    useEffect(() => {
        if (!lectura) return;

        const newAlerts = [];
        const percentage = lectura.nivel;

        if (percentage >= 95) {
            newAlerts.push({
                id: `${lectura.id_contenedor}-critical`,
                level: 'critical',
                container: selectedContenedor?.nombre || 'Contenedor de Residuos',
                message: 'Capacidad crítica alcanzada - Recolección inmediata requerida',
                time: new Date().toLocaleTimeString('es-MX')
            });
        } else if (percentage >= config.nivelLlenado) {
            newAlerts.push({
                id: `${lectura.id_contenedor}-warning`,
                level: 'warning',
                container: selectedContenedor?.nombre || 'Contenedor de Residuos',
                message: 'Nivel alto - Programar recolección pronto',
                time: new Date().toLocaleTimeString('es-MX')
            });
        }

        if (lectura.peso >= config.pesoMaximo) {
            newAlerts.push({
                id: `${lectura.id_contenedor}-peso`,
                level: 'critical',
                container: selectedContenedor?.nombre || 'Contenedor de Residuos',
                message: 'Peso máximo alcanzado',
                time: new Date().toLocaleTimeString('es-MX')
            });
        }

        if (lectura.alerta?.activo) {
            newAlerts.push({
                id: `${lectura.id_contenedor}-db-alert`,
                level: lectura.alerta.tipo === 'sobrepeso' ? 'critical' : 'warning',
                container: selectedContenedor?.nombre || 'Contenedor de Residuos',
                message: lectura.alerta.mensaje,
                time: new Date(lectura.timestamp).toLocaleTimeString('es-MX')
            });
        }

        setAlerts(newAlerts);
    }, [lectura, config, selectedContenedor]);

    const getStatus = (percentage) => {
        if (percentage >= 95) return 'critical';
        if (percentage >= config.nivelLlenado) return 'warning';
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

    if (isLoading && !lectura) {
        return (
            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Cargando datos del sensor...</p>
                    </div>
                </div>
            </div>
        );
    }

    const percentage = container?.nivel || 0;
    const status = getStatus(percentage);

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.headerSection}>
                    <h1 className={styles.title}>Monitoreo del Prototipo</h1>
                    
                    <div className={styles.selectorContainer}>
                        <label className={styles.selectorLabel}>Contenedor:</label>
                        <select
                            value={selectedContenedorId}
                            onChange={(e) => setSelectedContenedorId(Number(e.target.value))}
                            className={styles.selectorDropdown}
                            disabled={loadingContenedores}
                        >
                            {contenedores.map((cont) => (
                                <option key={cont.id_contenedor} value={cont.id_contenedor}>
                                    {cont.nombre} - {cont.ubicacion}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className={styles.addButton}
                            title="Agregar nuevo contenedor"
                        >
                            <Plus size={18} />
                            Nuevo
                        </button>
                    </div>

                    {lastUpdate && (
                        <p className={styles.lastUpdateText}>
                            Última actualización: {lastUpdate.toLocaleTimeString('es-MX')}
                        </p>
                    )}
                </div>

                {error && (
                    <div className={styles.errorContainer}>
                        <AlertCircle size={48} color="#ef4444" />
                        <p>Error: {error}</p>
                        <button onClick={refetch} className={styles.retryButton}>
                            Reintentar
                        </button>
                    </div>
                )}

                {!error && !container && (
                    <div className={styles.errorContainer}>
                        <p>No hay datos disponibles del contenedor</p>
                    </div>
                )}

                {!error && container && (
                    <>
                        {alerts.length > 0 && (
                            <div className={styles.alertsSection}>
                                <h2 className={styles.alertsTitle}>Alertas del Sistema</h2>
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

                        <div className={styles.containersGrid}>
                            <div className={styles.containerCard}>
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
                                            <p className={styles.sensorValue}>{percentage.toFixed(1)}%</p>
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
                                                <Magnet size={24} />
                                                <p className={styles.sensorLabel}>Electroimán</p>
                                            </div>
                                            <p className={styles.sensorValue}>
                                                {container.doorOpen ? 'ABIERTO' : 'CERRADO'}
                                            </p>
                                            <p className={styles.sensorSubtext}>Estado actual</p>
                                        </div>
                                    </div>

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
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailPanel}>
                            <h2 className={styles.detailTitle}>Detalles: {container.name}</h2>

                            <div className={styles.detailGrid}>
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
                                            <span className={styles.infoLabel}>Capacidad Máxima:</span>
                                            <span className={styles.infoValue}>{container.capacity} kg</span>
                                        </div>
                                    </div>
                                </div>

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
                                                <Droplets size={18} color="#D6D135" />
                                                <span className={styles.sensorDetailName}>Sensor de Nivel</span>
                                            </div>
                                            <p className={`${styles.sensorDetailValue} ${styles.sensorDetailValueViolet}`}>
                                                {container.nivel.toFixed(1)}%
                                            </p>
                                            <p className={styles.sensorDetailInfo}>
                                                Capacidad • Actualización: {Math.floor((Date.now() - container.lastUpdate) / 1000)}s
                                            </p>
                                            <div className={`${styles.sensorDetailStatus} ${styles.sensorStatusPurple}`}>
                                                <span className={styles.sensorStatusPurpleText}>● ACTIVO</span>
                                            </div>
                                        </div>

                                        <div className={styles.sensorDetailCard}>
                                            <div className={styles.sensorDetailHeader}>
                                                <Magnet size={18} color={container.doorOpen ? '#ef4444' : '#00AD4B'} />
                                                <span className={styles.sensorDetailName}>Sensor Magnético (Electroimán)</span>
                                            </div>
                                            <p
                                                className={`${styles.sensorDetailValue} ${
                                                    container.doorOpen ? styles.sensorDetailValueRed : styles.sensorDetailValueGreen
                                                }`}
                                            >
                                                {container.doorOpen ? 'ABIERTO' : 'CERRADO'}
                                            </p>
                                            <p className={styles.sensorDetailInfo}>
                                                Estado de electroimán • Actualización: {Math.floor((Date.now() - container.lastUpdate) / 1000)}s
                                            </p>
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

                        <div className={styles.card}>
                            <div className={styles.header}>
                                <h1 className={styles.title}>
                                    <Settings size={24} />
                                    Configuración IoT
                                </h1>
                            </div>

                            <div className={styles.controls}>
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

                                <div className={styles.controlGroup}>
                                    <label className={styles.label}>
                                        <span>Alerta de Llenado</span>
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
                            </div>

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

                            {saved && (
                                <div className={styles.successMessage}>
                                    ✓ Configuración guardada correctamente
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <AddContenedor
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onContenedorAdded={handleContenedorAdded}
            />
        </div>
    );
};

export default Configuration;