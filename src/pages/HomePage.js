import React, { useState } from 'react';
import Header from '../components/Header';
import CongestionDashboard from '../components/CongestionDashboard';
import { useComprehensiveCongestionData } from '../hooks/useCongestionData';
import { getOptimalArrivalTime } from '../services/airportApi';
import { formatCongestionTime, getCongestionLevelText, getCongestionColorClass } from '../services/airportApi';

const HomePage = () => {
  const [selectedFlight, setSelectedFlight] = useState('');
  const [passengerType, setPassengerType] = useState('normal');
  const [aiPrediction, setAiPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  const {
    congestionData,
    stats,
    lastUpdated
  } = useComprehensiveCongestionData();

  // AI 예측 요청
  const handleAIPrediction = async () => {
    if (!selectedFlight) return;
    
    setPredictionLoading(true);
    try {
      const prediction = await getOptimalArrivalTime(selectedFlight, passengerType);
      setAiPrediction(prediction);
    } catch (error) {
      console.error('AI prediction failed:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  // 혼잡도 레벨별 통계
  const getCongestionStats = () => {
    if (!congestionData.length) return { low: 0, medium: 0, high: 0 };
    
    return {
      low: congestionData.filter(item => item.congestionLevel === 'LOW').length,
      medium: congestionData.filter(item => item.congestionLevel === 'MEDIUM').length,
      high: congestionData.filter(item => item.congestionLevel === 'HIGH').length
    };
  };

  const congestionStats = getCongestionStats();

  return (
    <div className="App">
      <Header />

      {/* 메인 히어로 섹션 - 혼잡도 중심 */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>🚶‍♂️ 인천국제공항 승객 혼잡도</h1>
            <p className="hero-subtitle">AI 기반 실시간 혼잡도 분석 및 최적 도착시간 예측</p>
            
            {/* 실시간 혼잡도 요약 */}
            <div className="congestion-summary">
              <div className="summary-card congestion-low">
                <div className="summary-number">{congestionStats.low}</div>
                <div className="summary-label">원활</div>
              </div>
              <div className="summary-card congestion-medium">
                <div className="summary-number">{congestionStats.medium}</div>
                <div className="summary-label">보통</div>
              </div>
              <div className="summary-card congestion-high">
                <div className="summary-number">{congestionStats.high}</div>
                <div className="summary-label">혼잡</div>
              </div>
            </div>

            {lastUpdated && (
              <p className="last-updated">
                마지막 업데이트: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* AI 예측 섹션 */}
      <section className="ai-prediction-section">
        <div className="container">
          <div className="section-header">
            <h2>🤖 AI 기반 최적 도착시간 예측</h2>
            <p>항공편과 승객 유형을 선택하여 개인화된 도착시간을 추천받으세요</p>
          </div>

          <div className="prediction-controls">
            <div className="control-group">
              <label>항공편 선택:</label>
              <select 
                value={selectedFlight} 
                onChange={(e) => setSelectedFlight(e.target.value)}
              >
                <option value="">항공편을 선택하세요</option>
                {congestionData.slice(0, 10).map((item, index) => (
                  <option key={index} value={item.flightId}>
                    {item.flightId} - {item.destination} ({formatCongestionTime(item.scheduleDateTime)})
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>승객 유형:</label>
              <select 
                value={passengerType} 
                onChange={(e) => setPassengerType(e.target.value)}
              >
                <option value="normal">일반 승객</option>
                <option value="family">가족 단위</option>
                <option value="business">비즈니스</option>
                <option value="senior">시니어</option>
              </select>
            </div>

            <button 
              className="predict-btn"
              onClick={handleAIPrediction}
              disabled={!selectedFlight || predictionLoading}
            >
              {predictionLoading ? '분석 중...' : 'AI 예측 시작'}
            </button>
          </div>

          {/* AI 예측 결과 */}
          {aiPrediction && (
            <div className="prediction-result">
              <div className="result-header">
                <h3>📊 {aiPrediction.flightId} 항공편 예측 결과</h3>
                <div className="confidence-badge">
                  신뢰도: {Math.round(aiPrediction.confidence * 100)}%
                </div>
              </div>

              <div className="result-content">
                <div className="main-recommendation">
                  <div className="recommendation-time">
                    <span className="time-label">권장 도착시간</span>
                    <span className="time-value">{aiPrediction.recommendedArrival}</span>
                  </div>
                  
                  <div className="current-status">
                    <span className={`congestion-level ${getCongestionColorClass(aiPrediction.congestionLevel)}`}>
                      현재 혼잡도: {getCongestionLevelText(aiPrediction.congestionLevel)}
                    </span>
                    <span className="wait-time">
                      예상 대기시간: {aiPrediction.estimatedWaitTime}분
                    </span>
                  </div>
                </div>

                <div className="prediction-factors">
                  <h4>예측 근거:</h4>
                  <ul>
                    {aiPrediction.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 혼잡도 대시보드 */}
      <section id="congestion" className="dashboard-section">
        <div className="container">
          <CongestionDashboard />
        </div>
      </section>

      {/* 실시간 혼잡도 알림 */}
      <section className="alerts-section">
        <div className="container">
          <h2>🚨 실시간 혼잡도 알림</h2>
          
          <div className="alerts-grid">
            {/* 높은 혼잡도 구역 알림 */}
            {congestionData
              .filter(item => item.congestionLevel === 'HIGH')
              .slice(0, 3)
              .map((item, index) => (
                <div key={index} className="alert-card high-congestion">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <h4>혼잡 구역 알림</h4>
                    <p>{item.terminalId} - {item.area}</p>
                    <p>대기시간: {item.waitTime}분</p>
                    <p>승객 수: {item.passengerCount}명</p>
                  </div>
                </div>
              ))}

            {/* 원활한 구역 추천 */}
            {congestionData
              .filter(item => item.congestionLevel === 'LOW')
              .slice(0, 2)
              .map((item, index) => (
                <div key={index} className="alert-card low-congestion">
                  <div className="alert-icon">✅</div>
                  <div className="alert-content">
                    <h4>원활 구역 추천</h4>
                    <p>{item.terminalId} - {item.area}</p>
                    <p>대기시간: {item.waitTime}분</p>
                    <p>빠른 처리 가능</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* 혼잡도 통계 및 트렌드 */}
      <section className="statistics-section">
        <div className="container">
          <h2>📈 혼잡도 통계 및 트렌드</h2>
          
          {stats && (
            <div className="stats-dashboard">
              <div className="stat-item">
                <h3>총 모니터링 승객</h3>
                <span className="stat-number">{stats.totalPassengers.toLocaleString()}명</span>
              </div>
              
              <div className="stat-item">
                <h3>평균 대기시간</h3>
                <span className="stat-number">{stats.averageWaitTime}분</span>
              </div>
              
              <div className="stat-item">
                <h3>모니터링 구역</h3>
                <span className="stat-number">{stats.totalAreas}개</span>
              </div>
              
              <div className="stat-item">
                <h3>터미널별 현황</h3>
                <div className="terminal-stats">
                  <span>T1: {stats.terminalStats.T1}개 구역</span>
                  <span>T2: {stats.terminalStats.T2}개 구역</span>
                </div>
              </div>
            </div>
          )}

          {/* 혼잡도 분포 차트 */}
          <div className="congestion-distribution">
            <h3>현재 혼잡도 분포</h3>
            <div className="distribution-chart">
              <div className="chart-bar">
                <div className="bar-section congestion-low" 
                     style={{width: `${(congestionStats.low / congestionData.length) * 100}%`}}>
                  <span>원활 {congestionStats.low}</span>
                </div>
                <div className="bar-section congestion-medium" 
                     style={{width: `${(congestionStats.medium / congestionData.length) * 100}%`}}>
                  <span>보통 {congestionStats.medium}</span>
                </div>
                <div className="bar-section congestion-high" 
                     style={{width: `${(congestionStats.high / congestionData.length) * 100}%`}}>
                  <span>혼잡 {congestionStats.high}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>혼잡도 정보</h3>
              <p>📊 실시간 업데이트</p>
              <p>🤖 AI 기반 예측</p>
              <p>📱 모바일 최적화</p>
            </div>
            <div className="footer-section">
              <h3>연락처</h3>
              <p>📞 1577-2600</p>
              <p>📧 info@airport.kr</p>
            </div>
            <div className="footer-section">
              <h3>운영시간</h3>
              <p>24시간 모니터링</p>
              <p>실시간 데이터 제공</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 인천국제공항 승객 혼잡도 시스템. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
