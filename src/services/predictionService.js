import * as tf from '@tensorflow/tfjs';

class PredictionService {
  constructor() {
    this.model = null;
    this.scalerParams = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      
      const possiblePaths = [
        '/modelo_produccion/model.json',
        `${process.env.PUBLIC_URL}/modelo_produccion/model.json`,
        './modelo_produccion/model.json'
      ];
      
      let modelLoaded = false;
      let lastError = null;
      
      for (const path of possiblePaths) {
        try {
          this.model = await tf.loadLayersModel(path);
          modelLoaded = true;
          
          const scalerPath = path.replace('model.json', 'scaler_params.json');
          const response = await fetch(scalerPath);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          this.scalerParams = await response.json();
          break;
          
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      
      if (!modelLoaded) {
        throw new Error(`No se pudo cargar el modelo desde ninguna ruta. Último error: ${lastError?.message}`);
      }
      
      this.isReady = true;
      
    } catch (error) {
      console.error('Error al cargar el modelo:', error);
      throw new Error('No se pudo cargar el modelo. Verifica que los archivos estén en public/modelo_produccion_tfjs/');
    }
  }

  normalizeData(data) {
    const { min, scale } = this.scalerParams;
    return data.map((row) => {
      return row.map((val, j) => {
        return (val - min[j]) * scale[j];
      });
    });
  }

  denormalizePrediction(scaledValue) {
    const { min, scale } = this.scalerParams;
    return (scaledValue / scale[0]) + min[0];
  }

  calcularTasaCrecimiento(pesos, timestamps) {
    const n = pesos.length;
    
    if (n < 2) return 0;
    
    const horas = timestamps.map(t => (t - timestamps[0]) / (1000 * 60 * 60));
    
    const sumX = horas.reduce((a, b) => a + b, 0);
    const sumY = pesos.reduce((a, b) => a + b, 0);
    const sumXY = horas.reduce((sum, x, i) => sum + x * pesos[i], 0);
    const sumX2 = horas.reduce((sum, x) => sum + x * x, 0);
    
    const denominador = n * sumX2 - sumX * sumX;
    
    if (Math.abs(denominador) < 0.0001) {
      return pesos.length > 1 ? (pesos[pesos.length - 1] - pesos[0]) / (horas[horas.length - 1] || 1) : 0;
    }
    
    const pendiente = (n * sumXY - sumX * sumY) / denominador;
    
    return Math.max(0, pendiente);
  }

  predecirPorHeuristica(rawData, horasProyeccion = 1) {
    const ventanaAnalisis = Math.min(8, rawData.length); 
    const datosRecientes = rawData.slice(-ventanaAnalisis);
    
    const pesos = datosRecientes.map(d => d.peso_suave || d.peso);
    const timestamps = datosRecientes.map(d => new Date(d.timestamp).getTime());
    
    const tasaCrecimiento = this.calcularTasaCrecimiento(pesos, timestamps);
    const pesoActual = pesos[pesos.length - 1];
    
    const deltaPeso = tasaCrecimiento * horasProyeccion;
    const pesoPredicho = pesoActual + deltaPeso;
        
    return { pesoPredicho, deltaPeso, tasaCrecimiento };
  }

  calcularFechaEstimada(pesoActual, tasaCrecimiento, pesoObjetivo = null) {
    if (!tasaCrecimiento || tasaCrecimiento < 0.001) {
      return null;
    }

    let pesoAAlcanzar = pesoObjetivo;
    
    if (!pesoAAlcanzar) {
      const capacidadMaxima = 10; 
      pesoAAlcanzar = capacidadMaxima * 0.9; 
    }

    if (pesoActual >= pesoAAlcanzar) {
      return {
        fecha: new Date(),
        horasRestantes: 0,
        yaAlcanzado: true
      };
    }

    const pesoFaltante = pesoAAlcanzar - pesoActual;
    const horasNecesarias = pesoFaltante / tasaCrecimiento;

    const fechaEstimada = new Date();
    fechaEstimada.setHours(fechaEstimada.getHours() + horasNecesarias);

    return {
      fecha: fechaEstimada,
      horasRestantes: horasNecesarias,
      yaAlcanzado: false,
      pesoObjetivo: pesoAAlcanzar
    };
  }

  calcularConfianza(rawData, usoModelo = true) {
    let confianza = 100;
    const issues = [];
    
    if (rawData.length < 15) {
      const penalty = (15 - rawData.length) * 3;
      confianza -= penalty;
      issues.push(`Datos limitados (-${penalty}%)`);
    }
    
    const pesos = rawData.map(d => d.peso_suave || d.peso);
    const niveles = rawData.map(d => d.nivel_suave || d.nivel);
    
    const stdPeso = this.calcularDesviacionEstandar(pesos);
    const stdNivel = this.calcularDesviacionEstandar(niveles);
    
    const pesosUnicos = new Set(pesos.slice(-5)).size;
    if (pesosUnicos === 1) {
      confianza -= 25;
      issues.push('Sensor de peso estático (-25%)');
    }
    
    if (stdPeso < 0.01) {
      confianza -= 10;
      issues.push('Variabilidad de peso muy baja (-10%)');
    }
    if (stdNivel < 0.5) {
      confianza -= 10;
      issues.push('Variabilidad de nivel muy baja (-10%)');
    }
    
    const nivelesEn100 = niveles.filter(n => n >= 99.9).length;
    if (nivelesEn100 > rawData.length * 0.5) {
      confianza -= 20;
      issues.push('Nivel al 100% prolongado (-20%)');
    }
    
    const valoresNulos = rawData.filter(d => 
      !d.peso || !d.nivel || d.peso < 0 || d.nivel < 0
    ).length;
    
    if (valoresNulos > 0) {
      const penalty = valoresNulos * 5;
      confianza -= penalty;
      issues.push(`Valores nulos/inválidos (-${penalty}%)`);
    }
    
    const timestamps = rawData.map(d => new Date(d.timestamp).getTime());
    const gaps = [];
    for (let i = 1; i < timestamps.length; i++) {
      gaps.push(timestamps[i] - timestamps[i-1]);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const maxGap = Math.max(...gaps);
    
    if (maxGap > avgGap * 2) {
      confianza -= 15;
      issues.push('Gaps temporales grandes (-15%)');
    }
    
    if (!usoModelo) {
      confianza = Math.min(confianza, 65);
      issues.push('Usando método heurístico (-35%)');
    }
    
    const confianzaFinal = Math.max(0, Math.min(100, confianza));
    
    return confianzaFinal;
  }

  calcularDesviacionEstandar(valores) {
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    return Math.sqrt(varianza);
  }

  prepareSequence(rawData, containerId) {
    const SEQUENCE_LENGTH = 12;
        
    const processed = rawData.map(item => {
      const fecha = new Date(item.timestamp);
      const hora = fecha.getHours();
      const diaSemana = fecha.getDay();
      
      let features = [
        item.peso_suave || item.peso,
        item.nivel_suave || item.nivel,
        hora,
        diaSemana
      ];
      
      const contenedores = [1];
      contenedores.forEach(id => {
        features.push(id === containerId ? 1 : 0);
      });
      
      return features;
    });

    const sequence = processed.slice(-SEQUENCE_LENGTH);
    
    if (sequence.length < SEQUENCE_LENGTH) {
      throw new Error(`Se necesitan al menos ${SEQUENCE_LENGTH} lecturas. Tienes: ${sequence.length}`);
    }

    return sequence;
  }

  async predict(rawData, containerId) {
    if (!this.isReady) {
      throw new Error('Modelo no inicializado. Llama a initialize() primero.');
    }

    try {
      
      const pesoActual = rawData[rawData.length - 1].peso_suave || rawData[rawData.length - 1].peso;
      const nivelActual = rawData[rawData.length - 1].nivel_suave || rawData[rawData.length - 1].nivel;
      
      let pesoPredicho, deltaPeso, metodoUsado, confianza;
      let detalleModelo = null;
      
      try {
        const sequence = this.prepareSequence(rawData, containerId);
        const normalized = this.normalizeData(sequence);
        const inputTensor = tf.tensor3d([normalized]);
        
        const predictionTensor = this.model.predict(inputTensor);
        const scaledPrediction = (await predictionTensor.data())[0];
        const rawPrediction = this.denormalizePrediction(scaledPrediction);
        
        inputTensor.dispose();
        predictionTensor.dispose();
        
        const deltaModelo = rawPrediction - pesoActual;
        
        detalleModelo = {
          output_raw: scaledPrediction,
          output_denorm: rawPrediction,
          delta_calculado: deltaModelo
        };
        
        const umbralBajada = -0.1; 
        
        if (deltaModelo < umbralBajada) {
          throw new Error('Modelo predice bajada - usando heurística');
        }
        
        if (nivelActual >= 95 && deltaModelo < 0.05) {
          throw new Error('Modelo muy conservador - usando heurística');
        }
        
        pesoPredicho = rawPrediction;
        deltaPeso = deltaModelo;
        metodoUsado = 'LSTM';
        confianza = this.calcularConfianza(rawData, true);
                
      } catch (errorModelo) {
        
        const { pesoPredicho: pesoHeur, deltaPeso: deltaHeur, tasaCrecimiento } = 
          this.predecirPorHeuristica(rawData, 1);
        
        pesoPredicho = pesoHeur;
        deltaPeso = deltaHeur;
        metodoUsado = 'Heurística (Regresión Lineal)';
        confianza = this.calcularConfianza(rawData, false);
        
        detalleModelo = {
          ...detalleModelo,
          tasa_crecimiento: tasaCrecimiento,
          razon_heuristica: errorModelo.message
        };
        
      }
      
      if (pesoPredicho < pesoActual) {
        pesoPredicho = pesoActual;
        deltaPeso = 0;
      }
      
      if (nivelActual >= 99.5 && deltaPeso < 0.25) {
        const deltaOriginal = deltaPeso;
        deltaPeso = Math.max(deltaPeso, 0.25); 
        detalleModelo = {
          ...detalleModelo,
          delta_ajustado: true,
          delta_original: deltaOriginal,
          delta_forzado: deltaPeso
        };
      }
      
      const ventanaAnalisis = Math.min(8, rawData.length);
      const datosRecientes = rawData.slice(-ventanaAnalisis);
      const pesos = datosRecientes.map(d => d.peso_suave || d.peso);
      const timestamps = datosRecientes.map(d => new Date(d.timestamp).getTime());
      const tasaCrecimiento = this.calcularTasaCrecimiento(pesos, timestamps);
      
      const horasHastaPrediccion = deltaPeso > 0 && tasaCrecimiento > 0.001 
        ? deltaPeso / tasaCrecimiento 
        : 1; 
      
      const fechaPrediccion = new Date();
      fechaPrediccion.setHours(fechaPrediccion.getHours() + horasHastaPrediccion);
      
      const fechaLlenado = this.calcularFechaEstimada(pesoActual, tasaCrecimiento, 9.0);
      
      return {
        peso_predicho: pesoPredicho,
        delta_peso: deltaPeso,
        peso_actual: pesoActual,
        nivel_actual: nivelActual,
        confianza: confianza,
        timestamp: new Date(),
        fecha_prediccion: fechaPrediccion, 
        fecha_llenado: fechaLlenado, 
        interpretacion: this.interpretarPrediccion(deltaPeso, nivelActual),
        metadatos: {
          muestras_usadas: rawData.length,
          calidad_datos: confianza >= 80 ? 'Alta' : confianza >= 60 ? 'Media' : 'Baja',
          metodo_usado: metodoUsado,
          tasa_crecimiento: tasaCrecimiento,
          horas_hasta_prediccion: horasHastaPrediccion, 
          detalle_modelo: detalleModelo
        }
      };
      
    } catch (error) {
      console.error('Error crítico en predicción:', error);
      throw error;
    }
  }

  interpretarPrediccion(delta, nivelActual = 0) {
    if (nivelActual >= 99.5) {
      return {
        estado: "🔴 CONTENEDOR LLENO",
        decision: "CRÍTICO: Recolección INMEDIATA requerida. Contenedor al 100%.",
        color: "red",
        prioridad: "URGENTE"
      };
    }
    
    if (nivelActual >= 90) {
      return {
        estado: "🟠 CONTENEDOR CASI LLENO",
        decision: "IMPORTANTE: Programar recolección pronto. Nivel > 90%.",
        color: "orange",
        prioridad: "ALTA"
      };
    }
    
    if (delta >= 0.2) {
      return {
        estado: "🔴 Alto Ritmo de Depósito",
        decision: "ALERTA: Alto ritmo detectado. Evaluar recolección anticipada.",
        color: "red",
        prioridad: "MEDIA-ALTA"
      };
    } 
    
    if (delta >= 0.05) {
      return {
        estado: "🟢 Ritmo Normal",
        decision: "Operación normal. Continuar monitoreo estándar.",
        color: "green",
        prioridad: "NORMAL"
      };
    } 
    
    return {
      estado: "🟡 Bajo Ritmo",
      decision: "Ritmo bajo de depósito. Considerar optimización de ruta.",
      color: "orange",
      prioridad: "BAJA"
    };
  }
}

export default new PredictionService();