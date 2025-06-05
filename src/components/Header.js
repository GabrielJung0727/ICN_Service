import React from 'react';

const Header = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>🚶‍♂️ 인천국제공항</h1>
            <p>승객 혼잡도 모니터링 시스템</p>
          </div>
          <nav className="nav">
            <button onClick={() => scrollToSection('congestion')}>실시간 혼잡도</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>AI 예측</button>
            <button onClick={() => scrollToSection('alerts')}>혼잡도 알림</button>
            <button onClick={() => scrollToSection('statistics')}>통계 분석</button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 