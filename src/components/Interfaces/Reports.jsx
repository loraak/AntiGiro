import styles from './Admin/Register.module.css';
import { IoMdDownload } from "react-icons/io";
import { FaEye, FaFilter } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { GeneratePDF } from "./GeneratePDF";
import { lecturasService } from '../../services/lecturasService';

const Reports = () => { 
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [dateFilter, setDateFilter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
    const [alertas, setAlertas] = useState([]);
    const [alertasFilter, setAlertasFilter] = useState([]);

    useEffect(() => {
        historialAlerts();
    }, []);

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

    const historialAlerts = async () => {
        try {
            setIsLoadingAlerts(true);
            const response = await lecturasService.getAlertas(1);

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
        } finally {
            setIsLoadingAlerts(false);
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
                GeneratePDF(alertasFilter);
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
                    disabled={isGenerating}
                >
                    <IoMdDownload /> {isGenerating ? 'Generando PDF...' : 'Descargar Reportes'}
                </button>
            </div>

            <div className={styles.reportFiltersContainer}>
                <div className={styles.reportFilterGroup}>
                    <label className={styles.reportFilterLabel}>
                        <FaFilter className={styles.reportFilterIcon} />
                        Tipo de Evento:
                    </label>
                    <select 
                        className={styles.reportFilterSelect}
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="alerta">Alertas</option>
                        <option value="apertura">Aperturas</option>
                        <option value="medicion">Mediciones</option>
                    </select>
                </div>
                
                <div className={styles.reportFilterGroup}>
                    <label className={styles.reportFilterLabel}>Fecha:</label>
                    <input 
                        type="date" 
                        className={styles.reportFilterDate}
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.reportTableWrapper}>
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
                        {alertasFilter.map((registro) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.reportTableFooter}>
                <p className={styles.reportRecordCount}>
                    Mostrando {alertasFilter.length} registros
                </p>
            </div>
        </div>
    )
}



export default Reports;