import styles from './Register.module.css'; 
import { FaUserEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {useState} from 'react';
import AddUser from './AddUser'; 

const Register = () => { 
    const [isModalOpen, setIsModalOpen] = useState(false);

    return ( 
        <div className={styles.tableContainer}>
            <h2 className={styles.tittle}>Gestión de Empleados</h2>
            <div className={styles.actionsContainer}>
            <button onClick={() => setIsModalOpen(true)}className={styles.actionButton}>Nuevo Empleado</button>
            </div> 

            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <th className={styles.th}> Nombre </th>
                        <th className={styles.th}> Email </th>
                        <th className={styles.th}> Teléfono </th>
                        <th className={styles.th}> Rol </th>
                        <th className={styles.th}> Estado </th>
                        <th className={styles.th}> Acciones </th>
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    <tr className={styles.tr}>
                        <td className={styles.td}>Tenna</td>
                        <td className={styles.td}>tenna@example.com</td>
                        <td className={styles.td}>123456789</td>
                        <td className={styles.td}>Admin</td>
                        <td className={`${styles.td} ${styles.estadoActivo} ${styles.estadoBadge}`}>Activo</td>
                        <td className={`${styles.td} ${styles.actionsCell}`}>
                            <button className={styles.editButton}><FaUserEdit /></button>
                            <button className={styles.deleteButton}><MdDelete /></button>
                        </td>
                    </tr>
                    <tr className={styles.tr}>
                        <td className={styles.td}>Spamton</td>
                        <td className={styles.td}>spamton@example.com</td>
                        <td className={styles.td}>123456789</td>
                        <td className={styles.td}>Empleado</td>
                        <td className={`${styles.td} ${styles.estadoInactivo} ${styles.estadoBadge}`}>Inactivo</td>
                        <td className={`${styles.td} ${styles.actionsCell}`}>
                            <button className={styles.editButton}><FaUserEdit /></button>
                            <button className={styles.deleteButton}><MdDelete /></button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <AddUser
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export default Register; 