import { useState, useEffect } from 'react';
import styles from './AddUser.module.css'; 
import { IoClose } from 'react-icons/io5';
import { usuariosService } from '../../../services/usuarioService';

const EditUser = ({ isOpen, onClose, usuario, onUserUpdated }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        rol: 'tecnico', 
        activo: '', 
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                correo: usuario.correo || '',
                rol: usuario.rol || 'tecnico', 
                activo: usuario.activo || '1'
            });
        }
    }, [usuario]);

    if ((!isOpen || !usuario) && !isClosing) return null;

    const handleChange = (e) => {
    const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'nombre' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            setIsLoading(false);
            return;
        }

        if (!formData.correo.trim()) {
            setError('El correo es requerido');
            setIsLoading(false);
            return;
        }

        try {
            const dataToSend = {
                nombre: formData.nombre.trim(),
                correo: formData.correo.trim(),
                rol: formData.rol, 
                activo: formData.activo
            };

            await usuariosService.update(usuario.id_usuario, dataToSend);
            
            if (onUserUpdated) {
                onUserUpdated();
            }
            
            handleClose();
        } catch (err) {
            setError(err.message || 'Error al actualizar usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setError('');
            setIsClosing(false);
            onClose();
        }, 300); 
    };

    return (
        <div 
            className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`} 
            onClick={handleClose}
        >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} className={styles.closeButton}>
                    <IoClose />
                </button>

                <h2 className={styles.modalTitle}>Editar Usuario</h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre Completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej. Anthony Tenna"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej. tenna@gmail.com"
                            required
                            disabled={true}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Rol</label>
                        <select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="tecnico">Técnico</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Activo</label>
                        <select
                            name="activo"
                            value={formData.activo}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="1">Activo</option>
                            <option value="0">Inactivo</option>
                        </select>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;