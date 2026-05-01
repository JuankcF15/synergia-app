import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinessData = async () => {
    try {
      const response = await api.get('/api/profile/');
      setBusinessData(response.data);
    } catch (error) {
      console.error('Error al obtener datos de la empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessData = async (newData) => {
    try {
      const response = await api.patch('/api/profile/', newData);
      setBusinessData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar datos de la empresa:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  return (
    <BusinessContext.Provider value={{ businessData, loading, updateBusinessData, fetchBusinessData }}>
      {children}
    </BusinessContext.Provider>
  );
};
