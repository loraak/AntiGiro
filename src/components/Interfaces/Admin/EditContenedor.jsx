import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { contenedoresService } from '../../../services/contenedoresService';
import { authService } from '../../../services/authService';
import styles from './AddUser.module.css';

const EditContenedor = ({ isOpen, onClose, contenedor, onContenedorUpdated }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        peso_maximo: 5,
        nivel_alerta: 80,
        activo: 1,
        id_usuario: null
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (contenedor && isOpen) {
            const userId = authService.getUsuarioId();
            
            setFormData({
                nombre: contenedor.nombre || '',
                ubicacion: contenedor.ubicacion || '',
                peso_maximo: Number(contenedor.peso_maximo) || 5,
                nivel_alerta: Number(contenedor.nivel_alerta) || 80,
                activo: contenedor.activo ?? 1,
                id_usuario: userId || null
            });
            setError('');
        }
    }, [contenedor, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'peso_maximo' || name === 'nivel_alerta' || name === 'id_usuario' || name === 'activo'
                ? Number(value) 
                : value
        }));
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); 
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            if (!formData.nombre.trim()) {
                throw new Error('El nombre es requerido');
            }
            if (!formData.ubicacion.trim()) {
                throw new Error('La ubicación es requerida');
            }
            if (formData.peso_maximo <= 0) {
                throw new Error('El peso máximo debe ser mayor a 0');
            }
            if (formData.nivel_alerta < 0 || formData.nivel_alerta > 100) {
                throw new Error('El nivel de alerta debe estar entre 0 y 100');
            }
            if (!formData.id_usuario) {
                throw new Error('No se pudo obtener el usuario. Por favor, inicia sesión nuevamente.');
            }

            await contenedoresService.update(contenedor.id_contenedor, formData);
            onContenedorUpdated();
        } catch (err) {
            setError(err.message || 'Error al actualizar el contenedor');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen && !isClosing) return null;
    if (!contenedor) return null;

    return (
        <div className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}>
            <div className={styles.modalContent}>
                <button
                    onClick={handleClose}
                    className={styles.closeButton}
                    disabled={loading}
                >
                    <X size={24} />
                </button>

                <h2 className={styles.modalTitle}>Editar Contenedor</h2>

                <div className={styles.infoBox}>
                    {contenedor.actualizado_en && (
                        <p className={styles.infoText}>
                            <strong>Última actualización:</strong> {new Date(contenedor.actualizado_en).toLocaleString('es-MX')}
                        </p>
                    )}
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Nombre del Contenedor *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Contenedor Principal"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Ubicación *
                    </label>
                    <input
                        type="text"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        placeholder="Ej: Edificio A - Planta Baja"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Estado
                    </label>
                    <select
                        name="activo"
                        value={formData.activo}
                        onChange={handleChange}
                        className={styles.select}
                    >
                        <option value={1}>Activo</option>
                        <option value={0}>Inactivo</option>
                    </select>
                </div>

                <div className={styles.buttonContainer}>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={styles.saveButton}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditContenedor;