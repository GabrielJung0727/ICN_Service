import React, { useState, useEffect, useCallback } from 'react';
import { 
  getCongestionData, 
  getCongestionStats,
  searchCongestionData,
  getAirlineList,
  getDestinationList,
  getAreaList,
  getFlightCongestionDetail,
  getCongestionLevelText,
  getCongestionColorClass,
  formatCongestionTime
} from '../services/airportApi';

const CongestionDashboard = () => {
  const [congestionData, setCongestionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('search');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flightDetail, setFlightDetail] = useState(null);
  
  // 검색 및 필터 상태
  const [searchParams, setSearchParams] = useState({
    query: '',
    flightType: 'all',
    terminal: 'all',
    area: 'all',
    airline: 'all',
    congestionLevel: 'all',
    destination: 'all'
  });
  
  // 옵션 리스트
  const [airlines, setAirlines] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [areas, setAreas] = useState([]);

  const handleSearch = useCallback(async () => {
    try {
      const result = await searchCongestionData(searchParams);
      setFilteredData(result);
    } catch (err) {
      console.error('Error searching data:', err);
      setFilteredData([]);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
    loadOptions();
    
    const interval = setInterval(() => {
      loadData();
    }, 120000); // 2분마다 새로고침

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [congestionResult, statsResult] = await Promise.all([
        getCongestionData(),
        getCongestionStats()
      ]);
      
      setCongestionData(congestionResult);
      setStats(statsResult);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [airlinesResult, destinationsResult, areasResult] = await Promise.all([
        getAirlineList(),
        getDestinationList(),
        getAreaList()
      ]);
      
      setAirlines(airlinesResult);
      setDestinations(destinationsResult);
      setAreas(areasResult);
    } catch (err) {
      console.error('Error loading options:', err);
    }
  };

  const handleSearchParamChange = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFlightSelect = async (flightId) => {
    try {
      setSelectedFlight(flightId);
      const detail = await getFlightCongestionDetail(flightId);
      setFlightDetail(detail);
      setActiveView('detail');
    } catch (err) {
      console.error('Error loading flight detail:', err);
    }
  };

  const resetSearch = () => {
    setSearchParams({
      query: '',
      flightType: 'all',
      terminal: 'all',
      area: 'all',
      airline: 'all',
      congestionLevel: 'all',
      destination: 'all'
    });
  };

  if (loading) {
    return (
      <div className="congestion-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>혼잡도 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="congestion-dashboard">
        <div className="error-container">
          <h3>오류 발생</h3>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="congestion-dashboard">
      <div className="dashboard-header">
        <h2>🛫 실시간 공항 혼잡도 모니터링</h2>
        <div className="view-tabs">
          <button 
            className={`tab-button ${activeView === 'search' ? 'active' : ''}`}
            onClick={() => setActiveView('search')}
          >
            항공편 검색
          </button>
          <button 
            className={`tab-button ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            전체 현황
          </button>
          <button 
            className={`tab-button ${activeView === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveView('terminal')}
          >
            터미널별
          </button>
          <button 
            className={`tab-button ${activeView === 'area' ? 'active' : ''}`}
            onClick={() => setActiveView('area')}
          >
            구역별
          </button>
          {selectedFlight && (
            <button 
              className={`tab-button ${activeView === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveView('detail')}
            >
              상세정보
            </button>
          )}
        </div>
      </div>

      {/* 검색 및 필터 섹션 */}
      {activeView === 'search' && (
        <div className="search-section">
          <div className="search-filters">
            <div className="search-row">
              <div className="search-input-group">
                <label>검색어</label>
                <input
                  type="text"
                  placeholder="항공편명, 항공사, 목적지 검색..."
                  value={searchParams.query}
                  onChange={(e) => handleSearchParamChange('query', e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <label>항공편 구분</label>
                <select 
                  value={searchParams.flightType}
                  onChange={(e) => handleSearchParamChange('flightType', e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="departure">출발편</option>
                  <option value="arrival">도착편</option>
                </select>
              </div>

              <div className="filter-group">
                <label>터미널</label>
                <select 
                  value={searchParams.terminal}
                  onChange={(e) => handleSearchParamChange('terminal', e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="T1">터미널 1</option>
                  <option value="T2">터미널 2</option>
                </select>
              </div>
            </div>

            <div className="search-row">
              <div className="filter-group">
                <label>구역</label>
                <select 
                  value={searchParams.area}
                  onChange={(e) => handleSearchParamChange('area', e.target.value)}
                >
                  <option value="all">전체</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>항공사</label>
                <select 
                  value={searchParams.airline}
                  onChange={(e) => handleSearchParamChange('airline', e.target.value)}
                >
                  <option value="all">전체</option>
                  {airlines.map(airline => (
                    <option key={airline.code} value={airline.code}>
                      {airline.code} - {airline.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>혼잡도</label>
                <select 
                  value={searchParams.congestionLevel}
                  onChange={(e) => handleSearchParamChange('congestionLevel', e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="LOW">원활</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HIGH">혼잡</option>
                </select>
              </div>

              <div className="filter-group">
                <label>목적지</label>
                <select 
                  value={searchParams.destination}
                  onChange={(e) => handleSearchParamChange('destination', e.target.value)}
                >
                  <option value="all">전체</option>
                  {destinations.map(dest => (
                    <option key={dest.city} value={dest.city}>
                      {dest.city} ({dest.country})
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={resetSearch} className="reset-button">
                초기화
              </button>
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="search-results">
            <div className="results-header">
              <h3>검색 결과 ({filteredData.length}건)</h3>
            </div>
            
            <div className="flight-table">
              <table>
                <thead>
                  <tr>
                    <th>항공편</th>
                    <th>항공사</th>
                    <th>구분</th>
                    <th>목적지</th>
                    <th>터미널</th>
                    <th>구역</th>
                    <th>혼잡도</th>
                    <th>대기시간</th>
                    <th>상태</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((flight, index) => (
                    <tr key={`${flight.flightId}-${flight.area}-${index}`}>
                      <td className="flight-id">
                        <strong>{flight.flightId}</strong>
                      </td>
                      <td>
                        <span className="airline-code">{flight.flightCode}</span>
                        <br />
                        <small>{flight.airline}</small>
                      </td>
                      <td>
                        <span className={`flight-type ${flight.flightType}`}>
                          {flight.flightType === 'departure' ? '출발' : '도착'}
                        </span>
                      </td>
                      <td>
                        <strong>{flight.destination}</strong>
                        <br />
                        <small>{flight.destinationCountry}</small>
                      </td>
                      <td className="terminal">{flight.terminalId}</td>
                      <td>{flight.area}</td>
                      <td>
                        <span className={`congestion-badge ${getCongestionColorClass(flight.congestionLevel)}`}>
                          {getCongestionLevelText(flight.congestionLevel)}
                        </span>
                      </td>
                      <td>{flight.waitTime}분</td>
                      <td>
                        <span className="flight-status">{flight.status}</span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleFlightSelect(flight.flightId)}
                          className="detail-button"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredData.length === 0 && (
                <div className="no-results">
                  <p>검색 조건에 맞는 항공편이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 전체 현황 */}
      {activeView === 'overview' && stats && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>전체 구역</h3>
              <div className="stat-value">{stats.totalAreas}</div>
            </div>
            <div className="stat-card">
              <h3>평균 대기시간</h3>
              <div className="stat-value">{stats.averageWaitTime}분</div>
            </div>
            <div className="stat-card">
              <h3>총 승객수</h3>
              <div className="stat-value">{stats.totalPassengers?.toLocaleString()}</div>
            </div>
          </div>

          <div className="congestion-distribution">
            <h3>혼잡도 분포</h3>
            <div className="distribution-bars">
              <div className="distribution-item">
                <span className="label">원활</span>
                <div className="bar">
                  <div 
                    className="fill congestion-low" 
                    style={{width: `${(stats.congestionDistribution.LOW / (stats.congestionDistribution.LOW + stats.congestionDistribution.MEDIUM + stats.congestionDistribution.HIGH)) * 100}%`}}
                  ></div>
                </div>
                <span className="count">{stats.congestionDistribution.LOW}</span>
              </div>
              <div className="distribution-item">
                <span className="label">보통</span>
                <div className="bar">
                  <div 
                    className="fill congestion-medium" 
                    style={{width: `${(stats.congestionDistribution.MEDIUM / (stats.congestionDistribution.LOW + stats.congestionDistribution.MEDIUM + stats.congestionDistribution.HIGH)) * 100}%`}}
                  ></div>
                </div>
                <span className="count">{stats.congestionDistribution.MEDIUM}</span>
              </div>
              <div className="distribution-item">
                <span className="label">혼잡</span>
                <div className="bar">
                  <div 
                    className="fill congestion-high" 
                    style={{width: `${(stats.congestionDistribution.HIGH / (stats.congestionDistribution.LOW + stats.congestionDistribution.MEDIUM + stats.congestionDistribution.HIGH)) * 100}%`}}
                  ></div>
                </div>
                <span className="count">{stats.congestionDistribution.HIGH}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 터미널별 현황 */}
      {activeView === 'terminal' && (
        <div className="terminal-section">
          <div className="terminal-grid">
            {['T1', 'T2'].map(terminal => {
              const terminalData = filteredData.filter(item => item.terminalId === terminal);
              const congestionCounts = {
                LOW: terminalData.filter(item => item.congestionLevel === 'LOW').length,
                MEDIUM: terminalData.filter(item => item.congestionLevel === 'MEDIUM').length,
                HIGH: terminalData.filter(item => item.congestionLevel === 'HIGH').length
              };
              
              return (
                <div key={terminal} className="terminal-card">
                  <h3>{terminal === 'T1' ? '터미널 1' : '터미널 2'}</h3>
                  <div className="terminal-stats">
                    <div className="stat-row">
                      <span>총 항공편:</span>
                      <span>{terminalData.length}편</span>
                    </div>
                    <div className="stat-row">
                      <span>평균 대기시간:</span>
                      <span>{terminalData.length > 0 ? Math.round(terminalData.reduce((sum, item) => sum + item.waitTime, 0) / terminalData.length) : 0}분</span>
                    </div>
                  </div>
                  <div className="congestion-summary">
                    <div className="congestion-item low">
                      <span>원활: {congestionCounts.LOW}</span>
                    </div>
                    <div className="congestion-item medium">
                      <span>보통: {congestionCounts.MEDIUM}</span>
                    </div>
                    <div className="congestion-item high">
                      <span>혼잡: {congestionCounts.HIGH}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 구역별 현황 */}
      {activeView === 'area' && (
        <div className="area-section">
          <div className="area-grid">
            {areas.map(area => {
              const areaData = filteredData.filter(item => item.area === area);
              const avgWaitTime = areaData.length > 0 ? 
                Math.round(areaData.reduce((sum, item) => sum + item.waitTime, 0) / areaData.length) : 0;
              
              return (
                <div key={area} className="area-card">
                  <h3>{area}</h3>
                  <div className="area-stats">
                    <div className="stat-value">{areaData.length}개 지점</div>
                    <div className="stat-label">평균 대기: {avgWaitTime}분</div>
                  </div>
                  <div className="area-congestion">
                    {['LOW', 'MEDIUM', 'HIGH'].map(level => {
                      const count = areaData.filter(item => item.congestionLevel === level).length;
                      return (
                        <div key={level} className={`congestion-dot ${getCongestionColorClass(level)}`}>
                          {count}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 항공편 상세 정보 */}
      {activeView === 'detail' && flightDetail && (
        <div className="detail-section">
          <div className="flight-detail-header">
            <h3>항공편 상세 정보</h3>
            <button onClick={() => setActiveView('search')} className="back-button">
              ← 검색으로 돌아가기
            </button>
          </div>
          
          <div className="flight-info-card">
            <div className="flight-basic-info">
              <h2>{flightDetail.flightId}</h2>
              <div className="flight-meta">
                <span className="airline">{flightDetail.flightCode} - {flightDetail.airline}</span>
                <span className="route">인천 → {flightDetail.destination}</span>
                <span className="terminal">터미널 {flightDetail.terminal}</span>
                <span className="gate">게이트 {flightDetail.gate}</span>
              </div>
            </div>
            
            <div className="overall-congestion">
              <h4>전체 혼잡도</h4>
              <span className={`congestion-badge large ${getCongestionColorClass(flightDetail.overallCongestion)}`}>
                {getCongestionLevelText(flightDetail.overallCongestion)}
              </span>
              <p>평균 대기시간: {flightDetail.averageWaitTime}분</p>
            </div>
          </div>

          <div className="area-detail-grid">
            <h4>구역별 상세 혼잡도</h4>
            {Object.entries(flightDetail.congestionByArea).map(([area, info]) => (
              <div key={area} className="area-detail-card">
                <h5>{area}</h5>
                <div className="area-info">
                  <div className="congestion-info">
                    <span className={`congestion-badge ${getCongestionColorClass(info.congestionLevel)}`}>
                      {getCongestionLevelText(info.congestionLevel)}
                    </span>
                  </div>
                  <div className="wait-info">
                    <span>대기시간: {info.waitTime}분</span>
                  </div>
                  <div className="passenger-info">
                    <span>승객수: {info.passengerCount}명</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CongestionDashboard; 