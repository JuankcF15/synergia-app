import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from '@mui/material';

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        // Simula un tiempo de carga de 4 segundos
        const timer = setTimeout(() => {
            auth().catch(() => setIsAuthorized(false));
        }, 4000);

        return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    if (isAuthorized === null) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{
                    background: 'linear-gradient(135deg, #5865F2, #9B4DFF)',
                    color: '#fff',
                    textAlign: 'center',
                }}
            >
                <Box>
                    <CircularProgress color="inherit" />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Cargando, por favor espera...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return isAuthorized ? children : <Navigate to="/business/login" />;
}

export default ProtectedRoute;