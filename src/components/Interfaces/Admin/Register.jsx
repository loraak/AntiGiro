import { useState, useEffect } from 'react';
import styles from './Register.module.css';
import { FaUserEdit } from "react-icons/fa";
import EditUser from './EditUser';
import AddUser from './AddUser';
import { usuariosService } from '../../../services/usuarioService'

const Register = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await usuariosService.getAll();
            setUsuarios(response.data || []);
        } catch (err) {
            setError(err.message || 'Error cargando usuarios');
            console.error('Error cargando usuarios:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (usuario) => {
        setSelectedUser(usuario);
        setIsEditModalOpen(true);
    };

    return (
        <div className={styles.tableContainer}>
            <h2 className={styles.title}>Gestión de Empleados</h2>
            <div className={styles.actionsContainer}>
                <button onClick={() => setIsModalOpen(true)}className={styles.actionButton}>Nuevo Empleado</button>
            </div> 

            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando usuarios...</p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={styles.th}>Nombre</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Rol</th>
                            <th className={styles.th}>Estado</th>
                            <th className={styles.th}>Fecha Creación</th>
                            <th className={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.emptyMessage}>
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id_usuario} className={styles.tr}>
                                    <td className={styles.td}>{usuario.nombre}</td>
                                    <td className={styles.td}>{usuario.correo}</td>
                                    <td className={styles.td}>
                                        <span className={
                                            usuario.rol === 'admin' 
                                                ? styles.rolAdmin 
                                                : styles.rolTecnico
                                        }>
                                            {usuario.rol === 'admin' ? 'Administrador' : 'Técnico'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.estadoBadge} ${
                                            usuario.activo 
                                                ? styles.estadoActivo 
                                                : styles.estadoInactivo
                                        }`}>
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        {new Date(usuario.creado_en).toLocaleDateString('es-MX')}
                                    </td>
                                    <td className={`${styles.td} ${styles.actionsCell}`}>
                                        <button 
                                            className={styles.editButton}
                                            onClick={() => handleEditClick(usuario)}
                                            title="Editar usuario"
                                        >
                                            <FaUserEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {selectedUser && (
                <EditUser
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onUserUpdated={loadUsuarios}
                    usuario={selectedUser}
                />
            )}

            {isModalOpen && (
                <AddUser
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUserAdded={loadUsuarios}
                />
            )   
            }            
        </div>
    );
};

export default Register;