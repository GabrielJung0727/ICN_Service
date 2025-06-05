import React from 'react';
import { formatTime } from '../services/airportApi';

const FlightTable = ({ flights, type, loading, error }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>항공편 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ 항공편 정보를 불러오는데 실패했습니다.</p>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="no-data-container">
        <p>📭 현재 표시할 항공편 정보가 없습니다.</p>
      </div>
    );
  }

  const getStatusClass = (remark) => {
    if (!remark) return '';
    
    const status = remark.toLowerCase();
    if (status.includes('정시') || status.includes('on time')) return 'on-time';
    if (status.includes('지연') || status.includes('delay')) return 'delayed';
    if (status.includes('도착') || status.includes('arrived')) return 'arrived';
    if (status.includes('출발') || status.includes('departed')) return 'departed';
    if (status.includes('취소') || status.includes('cancel')) return 'cancelled';
    
    return '';
  };

  return (
    <div className="flights-table">
      <div className="table-header">
        <div>항공편</div>
        <div>항공사</div>
        <div>{type === 'departure' ? '목적지' : '출발지'}</div>
        <div>예정시간</div>
        <div>게이트</div>
        <div>터미널</div>
        <div>상태</div>
      </div>
      
      {flights.map((flight, index) => (
        <div key={`${flight.flightId}-${index}`} className="table-row">
          <div className="flight-number">{flight.flightId || '-'}</div>
          <div className="airline">{flight.airline || '-'}</div>
          <div className="destination">{flight.airport || '-'}</div>
          <div className="time">{formatTime(flight.scheduleDateTime) || '-'}</div>
          <div className="gate">{flight.gateNo || flight.gate || '-'}</div>
          <div className="terminal">{flight.terminalId || '-'}</div>
          <div className={`status ${getStatusClass(flight.remark)}`}>
            {flight.remark || '정보없음'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightTable; 