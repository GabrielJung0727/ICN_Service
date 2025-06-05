import { useState, useEffect, useCallback } from 'react';
import {
  getCongestionData,
  getCongestionByTerminal,
  getCongestionByArea,
  getCongestionByFlight,
  getOptimalArrivalTime,
  getCongestionStats
} from '../services/airportApi';

// 실시간 혼잡도 데이터 훅
export const useCongestionData = (autoRefresh = true) => {
  const [congestionData, setCongestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCongestionData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCongestionData(params);
      setCongestionData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch congestion data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCongestionData();
    
    // 자동 새로고침 (2분마다 - 혼잡도는 더 자주 업데이트)
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchCongestionData();
      }, 2 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [fetchCongestionData, autoRefresh]);

  return {
    congestionData,
    loading,
    error,
    lastUpdated,
    refetch: fetchCongestionData
  };
};

// 터미널별 혼잡도 훅
export const useTerminalCongestion = (terminalId, autoRefresh = true) => {
  const [terminalData, setTerminalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTerminalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCongestionByTerminal(terminalId);
      setTerminalData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch terminal congestion data:', err);
    } finally {
      setLoading(false);
    }
  }, [terminalId]);

  useEffect(() => {
    if (terminalId) {
      fetchTerminalData();
      
      if (autoRefresh) {
        const interval = setInterval(() => {
          fetchTerminalData();
        }, 2 * 60 * 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [fetchTerminalData, autoRefresh, terminalId]);

  return {
    terminalData,
    loading,
    error,
    lastUpdated,
    refetch: fetchTerminalData
  };
};

// 구역별 혼잡도 훅
export const useAreaCongestion = (area, autoRefresh = true) => {
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAreaData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCongestionByArea(area);
      setAreaData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch area congestion data:', err);
    } finally {
      setLoading(false);
    }
  }, [area]);

  useEffect(() => {
    if (area) {
      fetchAreaData();
      
      if (autoRefresh) {
        const interval = setInterval(() => {
          fetchAreaData();
        }, 2 * 60 * 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [fetchAreaData, autoRefresh, area]);

  return {
    areaData,
    loading,
    error,
    lastUpdated,
    refetch: fetchAreaData
  };
};

// 항공편별 혼잡도 및 AI 예측 훅
export const useFlightCongestion = (flightId, passengerType = 'normal') => {
  const [flightData, setFlightData] = useState([]);
  const [optimalTime, setOptimalTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFlightData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [congestionData, aiPrediction] = await Promise.all([
        getCongestionByFlight(flightId),
        getOptimalArrivalTime(flightId, passengerType)
      ]);
      
      setFlightData(congestionData);
      setOptimalTime(aiPrediction);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch flight congestion data:', err);
    } finally {
      setLoading(false);
    }
  }, [flightId, passengerType]);

  useEffect(() => {
    if (flightId) {
      fetchFlightData();
    }
  }, [fetchFlightData, flightId]);

  return {
    flightData,
    optimalTime,
    loading,
    error,
    lastUpdated,
    refetch: fetchFlightData
  };
};

// 혼잡도 통계 훅
export const useCongestionStats = (autoRefresh = true) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCongestionStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch congestion stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchStats();
      }, 5 * 60 * 1000); // 5분마다 통계 업데이트
      
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refetch: fetchStats
  };
};

// 혼잡도 검색 훅
export const useCongestionSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCongestion = useCallback(async (query, filterType = 'all') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const allData = await getCongestionData();
      
      let filteredResults = allData.filter(item => {
        const searchTerm = query.toLowerCase();
        return (
          item.flightId?.toLowerCase().includes(searchTerm) ||
          item.airline?.toLowerCase().includes(searchTerm) ||
          item.destination?.toLowerCase().includes(searchTerm) ||
          item.area?.toLowerCase().includes(searchTerm) ||
          item.terminalId?.toLowerCase().includes(searchTerm)
        );
      });

      // 필터 타입별 추가 필터링
      if (filterType !== 'all') {
        switch (filterType) {
          case 'high':
            filteredResults = filteredResults.filter(item => item.congestionLevel === 'HIGH');
            break;
          case 'medium':
            filteredResults = filteredResults.filter(item => item.congestionLevel === 'MEDIUM');
            break;
          case 'low':
            filteredResults = filteredResults.filter(item => item.congestionLevel === 'LOW');
            break;
          case 'terminal1':
            filteredResults = filteredResults.filter(item => item.terminalId === 'T1');
            break;
          case 'terminal2':
            filteredResults = filteredResults.filter(item => item.terminalId === 'T2');
            break;
          default:
            // 기본값: 필터링 없음
            break;
        }
      }
      
      setSearchResults(filteredResults);
    } catch (err) {
      setError(err.message);
      console.error('Failed to search congestion data:', err);
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
    searchCongestion,
    clearSearch
  };
};

// 통합 혼잡도 데이터 훅
export const useComprehensiveCongestionData = () => {
  const congestionData = useCongestionData();
  const stats = useCongestionStats();
  const search = useCongestionSearch();

  const isLoading = congestionData.loading || stats.loading;
  const hasError = congestionData.error || stats.error;

  // 터미널별 데이터 분리
  const getTerminalData = useCallback((terminalId) => {
    return congestionData.congestionData.filter(item => item.terminalId === terminalId);
  }, [congestionData.congestionData]);

  // 구역별 데이터 분리
  const getAreaData = useCallback((area) => {
    return congestionData.congestionData.filter(item => item.area === area);
  }, [congestionData.congestionData]);

  // 혼잡도별 데이터 분리
  const getCongestionLevelData = useCallback((level) => {
    return congestionData.congestionData.filter(item => item.congestionLevel === level);
  }, [congestionData.congestionData]);

  return {
    congestionData: congestionData.congestionData,
    stats: stats.stats,
    search,
    loading: isLoading,
    error: hasError,
    lastUpdated: congestionData.lastUpdated,
    refetch: congestionData.refetch,
    getTerminalData,
    getAreaData,
    getCongestionLevelData
  };
}; 