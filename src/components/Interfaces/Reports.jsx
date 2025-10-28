import styles from './Admin/Register.module.css';
import { IoMdDownload } from "react-icons/io";
import { FaEye, FaFilter } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { GeneratePDF } from "./GeneratePDF";
import { lecturasService } from '../../services/lecturasService';
import { contenedoresService } from '../../services/contenedoresService';

const Reports = () => { 
    const [selectedFilter, setSelectedFilter] = useState('1');
    const [dateFilter, setDateFilter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
    const [alertas, setAlertas] = useState([]);
    const [contenedores, setContenedores] = useState([]);
    const [alertasFilter, setAlertasFilter] = useState([]);
    const [contenedorFilter, setContenedorFilter] = useState([]);

    useEffect(() => {
        contenedoresList();
    }, []);

    // Cargar alertas cuando cambie el contenedor seleccionado
    useEffect(() => {
        if (selectedFilter) {
            historialAlerts(selectedFilter);
            contenedorId(selectedFilter);
        }
    }, [selectedFilter]);

    useEffect(() => {
        if(!dateFilter) {
            setAlertasFilter(alertas);
        } else {
            const filtered = alertas.filter(alerta => {
                const alertaFecha = alerta.fecha;
                const [dia, mes, anio] = alertaFecha.split('/');
                const alertaDate = `${anio}-${mes}-${dia}`;

                return alertaDate === dateFilter;
            });
            setAlertasFilter(filtered);
        }
    }, [dateFilter, alertas]);

    const historialAlerts = async (contenedorId) => {
        try {
            setIsLoadingAlerts(true);
            const response = await lecturasService.getAlertas(contenedorId); // ✅ Usar el ID del contenedor
            const alertasTransformadas = response.data.map((alertas, index) => {
                const fecha = new Date(alertas.timestamp);
                return {
                    id: index+1,
                    fecha: fecha.toLocaleDateString('es-MX'),
                    hora: fecha.toLocaleTimeString('es-Mx', {hour12: false}),
                    peso: alertas.peso?.toFixed(1) || 'N/A',
                    nivel: alertas.nivel || 0,
                    estado: alertas.nivel >= 80 ? 'Crítico' :
                        alertas.nivel >= 60 ? 'Advertencia' : 'Normal',
                    detalles: alertas.alerta?.mensaje || 'Sin alertas'
                };
            });
            setAlertas(alertasTransformadas);

        } catch (err) {
            console.error('Error cargando alertas:', err);
            setAlertas([]);
        } finally {
            setIsLoadingAlerts(false);
        }
    }

    const contenedoresList = async () => {
        try {
            const response = await contenedoresService.getAll();
            setContenedores(response.data);
            
            // Cargar alertas del primer contenedor automáticamente
            if (response.data && response.data.length > 0) {
                setSelectedFilter(response.data[0].id_contenedor);
            }
        } catch (err) {
            console.error('Error cargando contenedores:', err);
        }
    }

    const contenedorId = async (idContenedor) => {
        try {
            const response = await contenedoresService.getOne(idContenedor);
            setContenedorFilter(response.data);
            console.log(response);
        } catch (err) {
            console.error('Error cargando contenedores:', err);
        }
    }
    // Cargar jsPDF y Chart.js cuando el componente se monta
    useEffect(() => {
        const scriptPDF = document.createElement('script');
        scriptPDF.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        scriptPDF.async = true;
        document.body.appendChild(scriptPDF);

        const scriptChart = document.createElement('script');
        scriptChart.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        scriptChart.async = true;
        document.body.appendChild(scriptChart);

        return () => {
            document.body.removeChild(scriptPDF);
            document.body.removeChild(scriptChart);
        };
    }, []);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        
        // Esperar a que jsPDF y Chart.js estén disponibles
        const checkLibraries = setInterval(() => {
            if (window.jspdf && window.Chart) {
                clearInterval(checkLibraries);
                GeneratePDF(alertasFilter, contenedorFilter);
                setIsGenerating(false);
            }
        }, 100);

        // Timeout de seguridad
        setTimeout(() => {
            clearInterval(checkLibraries);
            if (!window.jspdf || !window.Chart) {
                alert('Error al cargar las librerías. Por favor intenta de nuevo.');
                setIsGenerating(false);
            }
        }, 5000);
    };

    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'Crítico':
                return styles.reportEstadoCritico;
            case 'Advertencia':
                return styles.reportEstadoAdvertencia;
            case 'Normal':
                return styles.reportEstadoNormal;
            default:
                return '';
        }
    };

    return ( 
        <div className={styles.tableContainer}>
            <h2 className={styles.title}>Historial de Monitoreo</h2>
            
            <div className={styles.actionsContainer}>
                <button 
                    onClick={handleDownloadPDF} 
                    className={styles.actionButton}
                    disabled={isGenerating || isLoadingAlerts}
                >
                    <IoMdDownload /> {isGenerating ? 'Generando PDF...' : 'Descargar Reportes'}
                </button>
            </div>

            <div className={styles.reportFiltersContainer}>
                <div className={styles.reportFilterGroup}>
                    <label className={styles.reportFilterLabel}>
                        <FaFilter className={styles.reportFilterIcon} />
                        Contenedor:
                    </label>
                    <select 
                        className={styles.reportFilterSelect}
                        value={selectedFilter}
                        onChange={(e) => {
                            const nuevoId = parseInt(e.target.value);
                            console.log('🎯 Contenedor seleccionado:', nuevoId); // Debug
                            setSelectedFilter(nuevoId);
                            contenedorId(nuevoId);
                            setDateFilter(''); // Limpiar filtro de fecha al cambiar contenedor
                        }}
                        disabled={isLoadingAlerts}
                    >
                        {contenedores.map((contenedor) => (
                            <option key={contenedor.id_contenedor} value={contenedor.id_contenedor}>
                                {contenedor.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className={styles.reportFilterGroup}>
                    <label className={styles.reportFilterLabel}>Fecha:</label>
                    <input 
                        type="date" 
                        className={styles.reportFilterDate}
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        disabled={isLoadingAlerts}
                    />
                </div>
            </div>

            <div className={styles.reportTableWrapper}>
                {isLoadingAlerts ? (
                    <div className={styles.loadingContainer}>
                        <p>Cargando alertas...</p>
                    </div>
                ) : (
                    <table className={styles.reportTable}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>Fecha</th>
                                <th className={styles.th}>Hora</th>
                                <th className={styles.th}>Peso (kg)</th>
                                <th className={styles.th}>Nivel (%)</th>
                                <th className={styles.th}>Estado</th>
                                <th className={styles.th}>Detalles</th>
                                <th className={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {alertasFilter.length > 0 ? (
                                alertasFilter.map((registro) => (
                                    <tr key={registro.id} className={styles.tr}>
                                        <td className={styles.td}>{registro.fecha}</td>
                                        <td className={styles.td}>{registro.hora}</td>
                                        <td className={styles.td}>{registro.peso} kg</td>
                                        <td className={styles.td}>
                                            <div className={styles.reportNivelContainer}>
                                                <div className={styles.reportNivelBar}>
                                                    <div 
                                                        className={styles.reportNivelFill} 
                                                        style={{width: `${registro.nivel}%`, backgroundColor: registro.nivel >= 80 ? '#D52D3E' : registro.nivel >= 60 ? '#EFEA5A' : '#629460'}}
                                                    ></div>
                                                </div>
                                                <span className={styles.reportNivelText}>{registro.nivel}%</span>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.estadoBadge} ${getEstadoClass(registro.estado)}`}>
                                                {registro.estado}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{registro.detalles}</td>
                                        <td className={`${styles.td} ${styles.actionsCell}`}>
                                            <button className={styles.reportViewButton} title="Ver detalles completos">
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className={styles.noData}>
                                        No hay alertas para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className={styles.reportTableFooter}>
                <p className={styles.reportRecordCount}>
                    Mostrando {alertasFilter.length} registros
                </p>
            </div>
        </div>
    );
}

export default Reports;