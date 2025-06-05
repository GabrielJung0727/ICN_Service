import { useState, useEffect, useCallback } from 'react';
import {
  getDepartureFlights,
  getArrivalFlights,
  getPassengerNotices,
  getAirportFacilities,
  getTransportInfo,
  searchFlights
} from '../services/airportApi';

// 항공편 데이터 훅
export const useFlightData = (type = 'departure', autoRefresh = true) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFlights = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let data = [];
      if (type === 'departure') {
        data = await getDepartureFlights(params);
      } else if (type === 'arrival') {
        data = await getArrivalFlights(params);
      }
      
      setFlights(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch flights:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchFlights();
    
    // 자동 새로고침 (5분마다)
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchFlights();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [fetchFlights, autoRefresh]);

  return {
    flights,
    loading,
    error,
    lastUpdated,
    refetch: fetchFlights
  };
};

// 공지사항 데이터 훅
export const useNoticeData = (autoRefresh = true) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNotices = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getPassengerNotices(params);
      setNotices(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
    
    // 자동 새로고침 (10분마다)
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchNotices();
      }, 10 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [fetchNotices, autoRefresh]);

  return {
    notices,
    loading,
    error,
    lastUpdated,
    refetch: fetchNotices
  };
};

// 공항 시설 데이터 훅
export const useFacilityData = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getAirportFacilities();
        setFacilities(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch facilities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return {
    facilities,
    loading,
    error
  };
};

// 교통편 데이터 훅
export const useTransportData = () => {
  const [transport, setTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getTransportInfo();
        setTransport(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch transport info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransport();
  }, []);

  return {
    transport,
    loading,
    error
  };
};

// 검색 훅
export const useFlightSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, type = 'all') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const results = await searchFlights(query, type);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      console.error('Failed to search flights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    search,
    clearSearch
  };
};

// 통합 공항 데이터 훅
export const useAirportData = () => {
  const departureFlights = useFlightData('departure');
  const arrivalFlights = useFlightData('arrival');
  const notices = useNoticeData();
  const facilities = useFacilityData();
  const transport = useTransportData();
  const search = useFlightSearch();

  const isLoading = 
    departureFlights.loading || 
    arrivalFlights.loading || 
    notices.loading || 
    facilities.loading || 
    transport.loading;

  const hasError = 
    departureFlights.error || 
    arrivalFlights.error || 
    notices.error || 
    facilities.error || 
    transport.error;

  return {
    departureFlights,
    arrivalFlights,
    notices,
    facilities,
    transport,
    search,
    isLoading,
    hasError
  };
}; 