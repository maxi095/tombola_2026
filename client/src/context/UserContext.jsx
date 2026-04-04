import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    getUserRequest, 
    getUsersRequest, 
    createUserRequest, 
    updateUserRequest, 
    deleteUserRequest 
} from "../api/user";

const UserContext = createContext();

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUsers debe usarse dentro de un UserProvider");
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(false);

    const getUser = useCallback(async (id) => {
        try {
            const res = await getUserRequest(id);
            return res.data;
        } catch (error) {
            console.error("Error al obtener usuario:", error);
        }
    }, []);
    
    const getUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUsersRequest();
            setUsers(res.data);
        } catch (error) {
            console.error("Error al listar usuarios:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (user) => {
        try {
            const res = await createUserRequest(user);
            setUsers((prev) => [...prev, res.data]);
            return res.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    }, []);

    const updateUser = useCallback(async (id, user) => {
        try {
            const res = await updateUserRequest(id, user);
            setUsers((prev) => prev.map(u => (u._id === id ? res.data : u)));
            return res.data;
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            throw error;
        }
    }, []);

    const deleteUser = useCallback(async (id) => {
        try {
            await deleteUserRequest(id);
            setUsers((prev) => prev.filter(u => u._id !== id));
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            throw error;
        }
    }, []);

    return (
        <UserContext.Provider value={{ 
            users, 
            loading,
            createUser, 
            updateUser, 
            deleteUser, 
            getUsers, 
            getUser 
        }}>
            {children}
        </UserContext.Provider>
    );
};
