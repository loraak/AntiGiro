import styles from './AddUser.module.css'; 
import {IoClose} from 'react-icons/io5';

const AddUser = ({isOpen, onClose}) => { 
    if (!isOpen) return null;

    const handleSubmit = () => { 
        alert('Usuario guardado'); 
        onClose(); 
    }; 

    return ( 
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>
                    <IoClose /> 
                </button>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre</label>
                    <input type="text" className={styles.input} placeholder="Ej. Tenna" />
                </div> 
                <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input type="email" className={styles.input} placeholder="Ej. tenna@gmail.com" />
                </div> 
                <div className={styles.formGroup}>
                    <label className={styles.label}>Teléfono</label>
                    <input type="tel" className={styles.input} placeholder="Ej. 123-456-7890" />
                </div> 
                <div className={styles.formGroup}>
                    <label className={styles.label}>Rol</label>
                    <select className={styles.select}>
                        <option value="admin">Admin</option>
                        <option value="empleado">Empleado</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Estado</label>
                    <select className={styles.select}>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>

                <div className={styles.buttonContainer}>
                    <button onClick={handleSubmit} className={styles.saveButton}>Guardar Usuario</button>
                </div>
            </div>
        </div>
    ); 
}; 

export default AddUser;