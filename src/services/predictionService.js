// src/services/predictionService.js
import * as tf from '@tensorflow/tfjs';

class PredictionService {
  constructor() {
    this.model = null;
    this.scalerParams = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      console.log('Cargando modelo LSTM...');
      
      const possiblePaths = [
        '/modelo_produccion/model.json',
        `${process.env.PUBLIC_URL}/modelo_produccion/model.json`,
        './modelo_produccion/model.json'
      ];
      
      let modelLoaded = false;
      let lastError = null;
      
      for (const path of possiblePaths) {
        try {
          console.log(`Intentando cargar desde: ${path}`);
          this.model = await tf.loadLayersModel(path);
          modelLoaded = true;
          console.log(`Modelo cargado exitosamente desde: ${path}`);
          
          const scalerPath = path.replace('model.json', 'scaler_params.json');
          const response = await fetch(scalerPath);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          this.scalerParams = await response.json();
          break;
          
        } catch (error) {
          console.warn(`No se pudo cargar desde ${path}:`, error.message);
          lastError = error;
          continue;
        }
      }
      
      if (!modelLoaded) {
        throw new Error(`No se pudo cargar el modelo desde ninguna ruta. Último error: ${lastError?.message}`);
      }
      
      this.isReady = true;
      console.log('Modelo LSTM cargado correctamente');
      console.log(`Features esperadas: ${this.scalerParams.n_features}`);
      
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

  // 🆕 Calcular tasa de crecimiento usando regresión lineal
  calcularTasaCrecimiento(pesos, timestamps) {
    const n = pesos.length;
    
    if (n < 2) return 0;
    
    // Convertir timestamps a horas desde el primer valor
    const horas = timestamps.map(t => (t - timestamps[0]) / (1000 * 60 * 60));
    
    // Regresión lineal simple: y = mx + b
    const sumX = horas.reduce((a, b) => a + b, 0);
    const sumY = pesos.reduce((a, b) => a + b, 0);
    const sumXY = horas.reduce((sum, x, i) => sum + x * pesos[i], 0);
    const sumX2 = horas.reduce((sum, x) => sum + x * x, 0);
    
    const denominador = n * sumX2 - sumX * sumX;
    
    if (Math.abs(denominador) < 0.0001) {
      // División por cero, calcular promedio simple
      return pesos.length > 1 ? (pesos[pesos.length - 1] - pesos[0]) / (horas[horas.length - 1] || 1) : 0;
    }
    
    const pendiente = (n * sumXY - sumX * sumY) / denominador;
    
    return Math.max(0, pendiente); // kg por hora (nunca negativo)
  }

  // 🆕 Predicción heurística basada en tendencia
  predecirPorHeuristica(rawData, horasProyeccion = 1) {
    const ventanaAnalisis = Math.min(8, rawData.length); // Últimos 8 valores o los disponibles
    const datosRecientes = rawData.slice(-ventanaAnalisis);
    
    const pesos = datosRecientes.map(d => d.peso_suave || d.peso);
    const timestamps = datosRecientes.map(d => new Date(d.timestamp).getTime());
    
    const tasaCrecimiento = this.calcularTasaCrecimiento(pesos, timestamps);
    const pesoActual = pesos[pesos.length - 1];
    
    const deltaPeso = tasaCrecimiento * horasProyeccion;
    const pesoPredicho = pesoActual + deltaPeso;
    
    console.log(`📊 Predicción Heurística:`);
    console.log(`   Tasa calculada: ${tasaCrecimiento.toFixed(4)} kg/hora`);
    console.log(`   Proyección ${horasProyeccion}h: ${pesoPredicho.toFixed(4)} kg`);
    console.log(`   Delta esperado: ${deltaPeso.toFixed(4)} kg`);
    
    return { pesoPredicho, deltaPeso, tasaCrecimiento };
  }

  // Calcular confianza basada en calidad de datos
  calcularConfianza(rawData, usoModelo = true) {
    let confianza = 100;
    const issues = [];
    
    // 1. Penalizar si hay pocos datos
    if (rawData.length < 15) {
      const penalty = (15 - rawData.length) * 3;
      confianza -= penalty;
      issues.push(`Datos limitados (-${penalty}%)`);
    }
    
    // 2. Verificar variabilidad de datos
    const pesos = rawData.map(d => d.peso_suave || d.peso);
    const niveles = rawData.map(d => d.nivel_suave || d.nivel);
    
    const stdPeso = this.calcularDesviacionEstandar(pesos);
    const stdNivel = this.calcularDesviacionEstandar(niveles);
    
    // Detectar datos completamente estáticos (sensor congelado)
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
    
    // 3. Detectar nivel al 100% durante mucho tiempo
    const nivelesEn100 = niveles.filter(n => n >= 99.9).length;
    if (nivelesEn100 > rawData.length * 0.5) {
      confianza -= 20;
      issues.push('Nivel al 100% prolongado (-20%)');
    }
    
    // 4. Verificar valores nulos o anómalos
    const valoresNulos = rawData.filter(d => 
      !d.peso || !d.nivel || d.peso < 0 || d.nivel < 0
    ).length;
    
    if (valoresNulos > 0) {
      const penalty = valoresNulos * 5;
      confianza -= penalty;
      issues.push(`Valores nulos/inválidos (-${penalty}%)`);
    }
    
    // 5. Verificar continuidad temporal
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
    
    // 🆕 6. Si estamos usando heurística, reducir confianza
    if (!usoModelo) {
      confianza = Math.min(confianza, 65); // Cap en 65% para heurística
      issues.push('Usando método heurístico (-35%)');
    }
    
    const confianzaFinal = Math.max(0, Math.min(100, confianza));
    
    if (issues.length > 0) {
      console.warn('⚠️ Problemas de calidad detectados:', issues);
    }
    
    return confianzaFinal;
  }

  calcularDesviacionEstandar(valores) {
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    return Math.sqrt(varianza);
  }

  prepareSequence(rawData, containerId) {
    const SEQUENCE_LENGTH = 12;
    
    console.log(`Preparando secuencia para contenedor: ${containerId}`);
    console.log(`Datos recibidos: ${rawData.length} lecturas`);
    
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

    console.log(`Secuencia preparada: ${sequence.length} muestras x ${sequence[0].length} features`);
    
    return sequence;
  }

  async predict(rawData, containerId) {
    if (!this.isReady) {
      throw new Error('Modelo no inicializado. Llama a initialize() primero.');
    }

    try {
      console.log('🔮 Iniciando predicción híbrida...');
      console.log('=====================================');
      
      const pesoActual = rawData[rawData.length - 1].peso_suave || rawData[rawData.length - 1].peso;
      const nivelActual = rawData[rawData.length - 1].nivel_suave || rawData[rawData.length - 1].nivel;
      
      let pesoPredicho, deltaPeso, metodoUsado, confianza;
      let detalleModelo = null;
      
      // ============================================
      // PASO 1: Intentar predicción con LSTM
      // ============================================
      try {
        const sequence = this.prepareSequence(rawData, containerId);
        const normalized = this.normalizeData(sequence);
        const inputTensor = tf.tensor3d([normalized]);
        
        const predictionTensor = this.model.predict(inputTensor);
        const scaledPrediction = (await predictionTensor.data())[0];
        const rawPrediction = this.denormalizePrediction(scaledPrediction);
        
        inputTensor.dispose();
        predictionTensor.dispose();
        
        console.log('🤖 Predicción LSTM:');
        console.log(`   Output normalizado: ${scaledPrediction.toFixed(4)}`);
        console.log(`   Output denormalizado: ${rawPrediction.toFixed(4)} kg`);
        console.log(`   Peso actual: ${pesoActual.toFixed(4)} kg`);
        
        const deltaModelo = rawPrediction - pesoActual;
        console.log(`   Delta calculado: ${deltaModelo.toFixed(4)} kg`);
        
        detalleModelo = {
          output_raw: scaledPrediction,
          output_denorm: rawPrediction,
          delta_calculado: deltaModelo
        };
        
        // ============================================
        // PASO 2: Validar si el modelo tiene sentido
        // ============================================
        const umbralBajada = -0.1; // Umbral para considerar que el modelo está confundido
        
        if (deltaModelo < umbralBajada) {
          console.warn('⚠️ MODELO CONFUNDIDO: Predice bajada de peso (imposible)');
          throw new Error('Modelo predice bajada - usando heurística');
        }
        
        // Si el nivel está muy alto y el modelo predice poco crecimiento
        if (nivelActual >= 95 && deltaModelo < 0.05) {
          console.warn('⚠️ MODELO CONSERVADOR: Contenedor casi lleno pero predice poco crecimiento');
          throw new Error('Modelo muy conservador - usando heurística');
        }
        
        // ✅ El modelo parece razonable, usar su predicción
        pesoPredicho = rawPrediction;
        deltaPeso = deltaModelo;
        metodoUsado = 'LSTM';
        confianza = this.calcularConfianza(rawData, true);
        
        console.log('✅ Predicción LSTM aceptada');
        
      } catch (errorModelo) {
        // ============================================
        // PASO 3: Fallback a predicción heurística
        // ============================================
        console.warn(`❌ Modelo no confiable: ${errorModelo.message}`);
        console.log('🔄 Cambiando a predicción heurística...');
        
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
        
        console.log('✅ Predicción heurística aplicada');
      }
      
      // ============================================
      // PASO 4: Ajustes de seguridad
      // ============================================
      
      // 4.1: Nunca permitir peso predicho menor al actual
      if (pesoPredicho < pesoActual) {
        console.warn('⚠️ Ajustando peso predicho (era menor al actual)');
        pesoPredicho = pesoActual;
        deltaPeso = 0;
      }
      
      // 4.2: Si el contenedor está lleno, forzar alerta
      if (nivelActual >= 99.5 && deltaPeso < 0.25) {
        console.warn('🚨 Contenedor LLENO detectado - ajustando delta para alertar');
        const deltaOriginal = deltaPeso;
        deltaPeso = Math.max(deltaPeso, 0.25); // Forzar como "Alto Ritmo"
        detalleModelo = {
          ...detalleModelo,
          delta_ajustado: true,
          delta_original: deltaOriginal,
          delta_forzado: deltaPeso
        };
      }
      
      console.log('=====================================');
      console.log('📊 RESULTADO FINAL:');
      console.log(`   Método: ${metodoUsado}`);
      console.log(`   Peso actual: ${pesoActual.toFixed(4)} kg`);
      console.log(`   Peso predicho: ${pesoPredicho.toFixed(4)} kg`);
      console.log(`   Delta final: ${deltaPeso.toFixed(4)} kg`);
      console.log(`   Confianza: ${confianza.toFixed(1)}%`);
      console.log('=====================================');
      
      return {
        peso_predicho: pesoPredicho,
        delta_peso: deltaPeso,
        peso_actual: pesoActual,
        nivel_actual: nivelActual,
        confianza: confianza,
        timestamp: new Date(),
        interpretacion: this.interpretarPrediccion(deltaPeso, nivelActual),
        metadatos: {
          muestras_usadas: rawData.length,
          calidad_datos: confianza >= 80 ? 'Alta' : confianza >= 60 ? 'Media' : 'Baja',
          metodo_usado: metodoUsado,
          detalle_modelo: detalleModelo
        }
      };
      
    } catch (error) {
      console.error('❌ Error crítico en predicción:', error);
      throw error;
    }
  }

  interpretarPrediccion(delta, nivelActual = 0) {
    // PRIORIDAD 1: Contenedor lleno (crítico)
    if (nivelActual >= 99.5) {
      return {
        estado: "🔴 CONTENEDOR LLENO",
        decision: "CRÍTICO: Recolección INMEDIATA requerida. Contenedor al 100%.",
        color: "red",
        prioridad: "URGENTE"
      };
    }
    
    // PRIORIDAD 2: Contenedor casi lleno
    if (nivelActual >= 90) {
      return {
        estado: "🟠 CONTENEDOR CASI LLENO",
        decision: "IMPORTANTE: Programar recolección pronto. Nivel > 90%.",
        color: "orange",
        prioridad: "ALTA"
      };
    }
    
    // PRIORIDAD 3: Evaluar por ritmo de depósito
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