import {useState, useEffect, useCallback} from 'react'; 
import {lecturasService} from '../services/lecturasService'; 

export const useLecturas = (idContenedor, intervalSeconds = 5) => { 
    const [lectura, setLectura] = useState(null); 
    const [alertas, setAlertas] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [lastUpdate, setLastUpdate] = useState(null); 

    const fetchLectura = useCallback(async () => { 
        try{ 
            setError(null); 
            const response = await lecturasService.getUltimaLectura(idContenedor); 

            if (response.success && response.data) { 
                const {alertas: alertasRaw, ...lecturaData} = response.data; 

                setLectura(response.data); 

                const alertasFormateadas = (alertasRaw || []).map(alerta => ({
                    id: alerta._id || `${alerta.id_contenedor}-${alerta.timestamp_inicio}-${alerta.tipo}`,
                    level: alerta.severidad || 'warning', 
                    message: alerta.mensaje,
                    time: new Date(alerta.timestamp_inicio).toLocaleTimeString('es-MX'),
                    timestamp: alerta.timestamp_inicio,
                    tipo: alerta.tipo,
                    severidad: alerta.severidad,
                    datos_relacionados: alerta.datos_relacionados
                }));

                alertasFormateadas.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                setAlertas(alertasFormateadas);

                setLastUpdate(new Date()); 
            } 
        } catch (err) { 
            console.error('Error al tomar lectura: ', err); 
            setError(err.message); 
        } finally { 
            setIsLoading(false); 
        }
    }, [idContenedor]); 

    useEffect(() => { 
        fetchLectura(); 
        const interval = setInterval(() => { 
            fetchLectura(); 
        }, intervalSeconds * 1000); 
    
        return () => clearInterval(interval);
    }, [fetchLectura, intervalSeconds]); 

    return { 
        lectura, 
        alertas, 
        isLoading, 
        error, 
        lastUpdate, 
        refetch: fetchLectura
    }; 
}; 