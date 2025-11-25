import logo from './../../assets/image.png';

export const GeneratePDF = async (historialData, contenedorData) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const greenP = [99, 148, 96]; // RGB
    const blueP = [20, 67, 124];
    const grayText = [100, 100, 100];

    // Header
    doc.setFillColor(...greenP);
    doc.rect(0, 0, 215, 25, 'F');
    
    // Logo
    doc.addImage(logo, 'PNG', 15, 5, 35, 17);
    
    // Título del reporte
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Reporte de Contenedores', 60, 17);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${new Date().toLocaleString('es-MX')}`, 60, 24);
    
    // ===== TARJETA DE DATOS DEL CONTENEDOR =====
    const containerCardY = 32;
    const containerCardWidth = 180;
    const containerCardHeight = 32;
    
    doc.setFillColor(245, 250, 255); // Azul muy claro
    doc.roundedRect(15, containerCardY, containerCardWidth, containerCardHeight, 2, 2, 'F');
    doc.setDrawColor(...blueP);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, containerCardY, containerCardWidth, containerCardHeight, 2, 2, 'S');
    
    // Título de la tarjeta
    doc.setFontSize(12);
    doc.setTextColor(...blueP);
    doc.setFont(undefined, 'bold');
    doc.text('Información del Contenedor', 17, containerCardY + 6);
    
    // Datos en dos columnas
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    // Columna izquierda
    doc.setFont(undefined, 'bold');
    doc.text('Nombre:', 17, containerCardY + 14);
    doc.setFont(undefined, 'normal');
    doc.text(contenedorData.nombre, 35, containerCardY + 14);
    
    doc.setFont(undefined, 'bold');
    doc.text('Ubicación:', 17, containerCardY + 20);
    doc.setFont(undefined, 'normal');
    doc.text(contenedorData.ubicacion, 35, containerCardY + 20);
    
    // Columna derecha
    doc.setFont(undefined, 'bold');
    doc.text('Peso máximo:', 110, containerCardY + 14);
    doc.setFont(undefined, 'normal');
    doc.text(`${contenedorData.peso_maximo} kg`, 140, containerCardY + 14);
    
    doc.setFont(undefined, 'bold');
    doc.text('Nivel de alerta:', 110, containerCardY + 20);
    doc.setFont(undefined, 'normal');
    doc.text(`${contenedorData.nivel_alerta}%`, 140, containerCardY + 20);
    
    // Usuario responsable (opcional, centrado abajo)
    doc.setFontSize(7);
    doc.setTextColor(...grayText);
    doc.text(`Responsable del contenedor: ${contenedorData.nombre_usuario} (${contenedorData.correo_usuario})`, 17, containerCardY + 28);
    
    // ===== RESUMEN ESTADÍSTICO =====
    const statsY = containerCardY + containerCardHeight + 10;
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Resumen Estadístico', 15, statsY);
    
    const nivelPromedio = (historialData.reduce((acc, d) => acc + d.nivel, 0) / historialData.length).toFixed(1);
    const pesoPromedio = (historialData.reduce((acc, d) => acc + parseFloat(d.peso), 0) / historialData.length).toFixed(2);
    const nivelMax = Math.max(...historialData.map(d => d.nivel));
    const pesoMax = Math.max(...historialData.map(d => parseFloat(d.peso)));
    const nivelMin = Math.min(...historialData.map(d => d.nivel));
    const pesoMin = Math.min(...historialData.map(d => parseFloat(d.peso)));
    
    // Tarjetas de estadísticas (3 columnas)
    const cardY = statsY + 7;
    const cardWidth = 58;
    const cardHeight = 28;
    
    // Tarjeta 1: Promedios
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...greenP);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, cardY, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(...greenP);
    doc.setFont(undefined, 'bold');
    doc.text('Promedio', 17, cardY + 6);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Nivel: ${nivelPromedio}%`, 17, cardY + 14);
    doc.text(`Peso: ${pesoPromedio} kg`, 17, cardY + 20);
    
    // Tarjeta 2: Máximos
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(78, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...greenP);
    doc.roundedRect(78, cardY, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(...greenP);
    doc.setFont(undefined, 'bold');
    doc.text('Máximo', 80, cardY + 6);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Nivel: ${nivelMax}%`, 80, cardY + 14);
    doc.text(`Peso: ${pesoMax} kg`, 80, cardY + 20);
    
    // Tarjeta 3: Mínimos
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(141, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...greenP);
    doc.roundedRect(141, cardY, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(...greenP);
    doc.setFont(undefined, 'bold');
    doc.text('Mínimo', 143, cardY + 6);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Nivel: ${nivelMin}%`, 143, cardY + 14);
    doc.text(`Peso: ${pesoMin} kg`, 143, cardY + 20);

    // Información adicional
    doc.setFontSize(9);
    doc.setTextColor(...grayText);
    doc.text(`Total de lecturas: ${historialData.length}`, 15, cardY + cardHeight + 6);
    
    // Preparar datos para gráficos (ordenados cronológicamente)
    const chartData = [...historialData].reverse();
    
    // Crear gráfica de nivel
    const canvasNivel = document.createElement('canvas');
    canvasNivel.width = 800;
    canvasNivel.height = 400;
    const ctxNivel = canvasNivel.getContext('2d');
    
    new window.Chart(ctxNivel, {
        type: 'line',
        data: {
            labels: chartData.map(d => `${d.fecha}\n${d.hora.substring(0, 5)}`),
            datasets: [{
                label: 'Nivel (%)',
                data: chartData.map(d => d.nivel),
                borderColor: '#14447C',
                backgroundColor: 'rgba(20, 68, 124, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Nivel de Llenado',
                    font: { size: 24, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Nivel (%)'
                    }
                }
            }
        }
    });
    
    // Esperar a que se renderice la gráfica
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Agregar gráfica de nivel al PDF
    const imgNivel = canvasNivel.toDataURL('image/png');
    const graphY = cardY + cardHeight + 14;
    doc.addImage(imgNivel, 'PNG', 20, graphY, 170, 70);
    
    // Crear gráfica de peso
    const canvasPeso = document.createElement('canvas');
    canvasPeso.width = 800;
    canvasPeso.height = 400;
    const ctxPeso = canvasPeso.getContext('2d');
    
    new window.Chart(ctxPeso, {
        type: 'bar',
        data: {
            labels: chartData.map(d => `${d.fecha}\n${d.hora.substring(0, 5)}`),
            datasets: [{
                label: 'Peso (kg)',
                data: chartData.map(d => parseFloat(d.peso)),
                backgroundColor: '#EFEA5A',
                borderColor: '#D6D135',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Peso Registrado',
                    font: { size: 24, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Peso (kg)'
                    }
                }
            }
        }
    });
    
    // Esperar a que se renderice la gráfica
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Agregar gráfica de peso al PDF
    const imgPeso = canvasPeso.toDataURL('image/png');
    doc.addImage(imgPeso, 'PNG', 20, graphY + 85, 170, 70);
    
    // Nueva página para la tabla de datos
    doc.addPage();

    // Header de segunda página
    doc.setFillColor(...greenP);
    doc.rect(0, 0, 215, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Detalle de Lecturas', 15, 13);
    
    // Tabla de datos
    let y = 32;
    
    historialData.forEach((item) => {
        if (y > 265) {
            doc.addPage();
            
            // Mini header en páginas adicionales
            doc.setFillColor(...greenP);
            doc.rect(0, 0, 215, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Detalle de Lecturas', 15, 13);
            
            y = 32;
        }
        
        // Tarjeta de lectura
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(15, y, 180, 30, 2, 2, 'F');
        
        doc.setDrawColor(...blueP);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, y, 180, 30, 2, 2, 'S');
        
        // Badge con número de lectura
        doc.setFillColor(...blueP);
        doc.roundedRect(18, y + 3, 8, 6, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(`#${item.id}`, 20, y + 7);
        
        // Fecha y hora
        doc.setFontSize(9);
        doc.setTextColor(...grayText);
        doc.setFont(undefined, 'normal');
        doc.text(`${item.fecha} - ${item.hora}`, 40, y + 7);
        
        // Datos principales
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Peso:', 18, y + 15);
        doc.setFont(undefined, 'normal');
        doc.text(`${item.peso} kg`, 32, y + 15);
        
        doc.setFont(undefined, 'bold');
        doc.text('Nivel:', 70, y + 15);
        doc.setFont(undefined, 'normal');
        doc.text(`${item.nivel}%`, 85, y + 15);
        
        doc.setFont(undefined, 'bold');
        doc.text('Estado:', 120, y + 15);
        doc.setFont(undefined, 'normal');
        
        // Color del estado
        if (item.estado.toLowerCase().includes('normal')) {
            doc.setTextColor(...greenP);
            doc.setFont(undefined, 'bold');
        } else if (item.estado.toLowerCase().includes('advertencia')) {
            doc.setTextColor(217, 119, 6);
            doc.setFont(undefined, 'bold');
        } else if (item.estado.toLowerCase().includes('crítico')) {
            doc.setTextColor(213, 45, 61);
            doc.setFont(undefined, 'bold');
        } else {
            doc.setTextColor(0, 0, 0);
        }
        doc.text(item.estado, 138, y + 15);
        
        // Detalles
        doc.setFontSize(8);
        doc.setTextColor(...grayText);
        doc.setFont(undefined, 'normal');
        doc.text(item.detalles || 'Sin detalles adicionales', 18, y + 23);
        
        y += 35;
    });

    // Footer final
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, 175, 285);
    }
    
    // Guardar PDF
    doc.save(`reporte-${contenedorData.nombre}-${new Date().getTime()}.pdf`);
};