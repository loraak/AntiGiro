import {useState, useEffect, useCallback} from 'react'; 
import {lecturasService} from '../services/lecturasService'; 

export const useLecturas = (idContenedor, intervalSeconds = 5) => { 
    const [lectura, setLectura] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [lastUpdate, setLastUpdate] = useState(null); 

    const fetchLectura = useCallback(async () => { 
        try{ 
            setError(null); 
            const response = await lecturasService.getUltimaLectura(idContenedor); 
            if (response.success && response.data) { 
                setLectura(response.data); 
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
        isLoading, 
        error, 
        lastUpdate, 
        refetch: fetchLectura
    }; 
}; 