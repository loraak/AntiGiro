import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { FaChartLine, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import styles from './Analysis.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analysis = () => {
    const [timeRange, setTimeRange] = useState('7dias');

    const trendChartData = {
        labels: ['27 Sep', '28 Sep', '29 Sep', '30 Sep', '01 Oct', '02 Oct', '03 Oct', '04 Oct', '05 Oct', '06 Oct', '07 Oct'],
        datasets: [
            {
                label: 'Nivel Real',
                data: [42, 48, 53, 61, 67, 72, 78, null, null, null, null],
                borderColor: '#14447C',
                backgroundColor: 'rgba(20, 68, 124, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#14447C',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Proyectada Jamón',
                data: [null, null, null, null, null, null, 78, 84, 89, 95, 100],
                borderColor: '#D52D3E',
                backgroundColor: 'rgba(213, 45, 62, 0.1)',
                borderWidth: 3,
                borderDash: [10, 5],
                pointRadius: 5,
                pointBackgroundColor: '#D52D3E',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const trendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        size: 14,
                        weight: '500',
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#2d3748',
                bodyColor: '#4a5568',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + '%';
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    },
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: '#e2e8f0',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    return (
        <div className={styles.analyticsContainer}>
            <div>
                <h1 className={styles.title}>
                    Análisis de Datos
                </h1>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{backgroundColor: '#fef3c7'}}>
                        <FaCalendarAlt style={{color: '#d97706'}} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Próximo Vaciado</p>
                        <h3 className={styles.statValue}>2 días</h3>
                        <p className={styles.statDetail}>Contenedor D - 05/10/2025</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{backgroundColor: '#dbeafe'}}>
                        <FaChartLine style={{color: '#14447C'}} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Velocidad Promedio</p>
                        <h3 className={styles.statValue}>6.0%/día</h3>
                        <p className={styles.statDetail}>Tasa de llenado actual</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{backgroundColor: '#d1fae5'}}>
                        <FaCheckCircle style={{color: '#629460'}} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Confianza Promedio</p>
                        <h3 className={styles.statValue}>90%</h3>
                        <p className={styles.statDetail}>Precisión del modelo</p>
                    </div>
                </div>
            </div>

            <div className={styles.controlsSection}>
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Rango:</label>
                        <select 
                            className={styles.filterSelect}
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7dias">Últimos 7 días</option>
                            <option value="15dias">Últimos 15 días</option>
                            <option value="30dias">Últimos 30 días</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                    <h2 className={styles.chartTitle}>Tendencia y Proyección de Llenado</h2>
                </div>
                <div style={{ height: '350px' }}>
                    <Line data={trendChartData} options={trendChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default Analysis;