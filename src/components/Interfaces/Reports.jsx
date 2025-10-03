import styles from './Admin/Register.module.css';
import { IoMdDownload } from "react-icons/io";
import { FaEye, FaFilter } from "react-icons/fa";
import { useState } from 'react';

const Reports = () => { 
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [dateFilter, setDateFilter] = useState('');

    const historialData = [
        {
            id: 1,
            fecha: '03/10/2025',
            hora: '14:30:25',
            peso: '4.2',
            nivel: 85,
            estado: 'Crítico',
            detalles: 'Contenedor casi lleno - Requiere vaciado'
        },
        {
            id: 2,
            fecha: '03/10/2025',
            hora: '09:15:40',
            peso: '4.1',
            nivel: 78,
            estado: 'Normal',
            detalles: 'Depósito de residuos realizado'
        },
        {
            id: 3,
            fecha: '03/10/2025',
            hora: '06:00:12',
            peso: '3.5',
            nivel: 72,
            estado: 'Normal',
            detalles: 'Lectura programada automática'
        },
        {
            id: 4,
            fecha: '02/10/2025',
            hora: '18:45:33',
            peso: '3.8',
            nivel: 67,
            estado: 'Advertencia',
            detalles: 'Nivel medio alcanzado - Monitoreo continuo'
        },
        {
            id: 5,
            fecha: '02/10/2025',
            hora: '12:22:18',
            peso: '2.3',
            nivel: 53,
            estado: 'Normal',
            detalles: 'Depósito de residuos realizado'
        },
        {
            id: 6,
            fecha: '02/10/2025',
            hora: '06:00:08',
            peso: '2.7',
            nivel: 48,
            estado: 'Normal',
            detalles: 'Lectura programada automática'
        },
        {
            id: 7,
            fecha: '01/10/2025',
            hora: '20:10:55',
            peso: '2.4',
            nivel: 42,
            estado: 'Normal',
            detalles: 'Depósito de residuos realizado'
        },
        {
            id: 8,
            fecha: '01/10/2025',
            hora: '15:30:27',
            peso: '4.9',
            nivel: 92,
            estado: 'Crítico',
            detalles: 'Capacidad máxima alcanzada - Acción inmediata'
        }
    ];

    const handleDownloadPDF = () => {
        alert('Generando reporte PDF...');
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
                <button onClick={handleDownloadPDF} className={styles.actionButton}>
                    <IoMdDownload /> Descargar Reportes
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
                        {historialData.map((registro) => (
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
                    Mostrando {historialData.length} registros
                </p>
            </div>
        </div>
    )
}

export default Reports;