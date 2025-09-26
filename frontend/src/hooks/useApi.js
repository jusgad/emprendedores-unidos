import { useState, useEffect } from 'react';

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Error en useApi:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  const refetch = async () => {
    if (url) {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Error en refetch:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { data, isLoading, error, refetch };
};

export default useApi;