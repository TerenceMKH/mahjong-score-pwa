import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const playerNames = ['上家', '對家', '下家'];
  const [scores, setScores] = useState(playerNames.map(() => Array(12).fill(0)));
  const [totalScores, setTotalScores] = useState([0, 0, 0]);
  const [isNegative, setIsNegative] = useState([false, false, false]);
  const [playerLastRecords, setPlayerLastRecords] = useState([null, null, null]);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [checkNames, setCheckNames] = useState(['玩家1', '玩家2', '玩家3', '玩家4']);
  const [checkInputs, setCheckInputs] = useState(['', '', '', '']);
  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  const [summaryTop, setSummaryTop] = useState(0);
  const [contentMargin, setContentMargin] = useState(0);

  useEffect(() => {
    const updatePositions = () => {
      let headerHeight = 0;
      if (headerRef.current) {
        headerHeight = headerRef.current.offsetHeight;
      }
      setSummaryTop(headerHeight);

      let summaryHeight = 0;
      if (summaryRef.current) {
        summaryHeight = summaryRef.current.offsetHeight;
      }
      setContentMargin(headerHeight + summaryHeight);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, []);

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('scores'));
    if (savedScores) {
      setScores(savedScores);
      savedScores.forEach((_, i) => calculateTotalScore(i, savedScores));
    }

    const savedTotals = JSON.parse(localStorage.getItem('totalScores'));
    if (savedTotals) {
      setTotalScores(savedTotals);
    }

    const savedNegative = JSON.parse(localStorage.getItem('isNegative'));
    if (savedNegative) {
      setIsNegative(savedNegative);
    }

    const savedRecords = JSON.parse(localStorage.getItem('playerLastRecords'));
    if (savedRecords) {
      setPlayerLastRecords(savedRecords);
    }

    const savedCheckNames = JSON.parse(localStorage.getItem('checkNames'));
    if (savedCheckNames) {
      setCheckNames(savedCheckNames);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem('totalScores', JSON.stringify(totalScores));
  }, [totalScores]);

  useEffect(() => {
    localStorage.setItem('isNegative', JSON.stringify(isNegative));
  }, [isNegative]);

  useEffect(() => {
    localStorage.setItem('playerLastRecords', JSON.stringify(playerLastRecords));
  }, [playerLastRecords]);

  useEffect(() => {
    localStorage.setItem('checkNames', JSON.stringify(checkNames));
  }, [checkNames]);

  const updateScore = (playerIndex, fieldIndex, value) => {
    const newScores = [...scores];
    newScores[playerIndex][fieldIndex] = parseInt(value) || 0;
    setScores(newScores);
    calculateTotalScore(playerIndex, newScores);
  };

  const calculateTotalScore = (playerIndex, currentScores = scores) => {
    let total = 0;
    for (let i = 0; i < currentScores[playerIndex].length; i++) {
      if (i === 0) {
        total += currentScores[playerIndex][i];
      } else if (currentScores[playerIndex][i] > 0) {
        total = Math.ceil(total * 1.5) + currentScores[playerIndex][i];
      }
    }
    const newTotals = [...totalScores];
    newTotals[playerIndex] = isNegative[playerIndex] ? -total : total;
    setTotalScores(newTotals);
  };

  const toggleSign = (playerIndex) => {
    const newIsNeg = !isNegative[playerIndex];
    const newNegative = [...isNegative];
    newNegative[playerIndex] = newIsNeg;
    setIsNegative(newNegative);

    let total = 0;
    for (let i = 0; i < scores[playerIndex].length; i++) {
      if (i === 0) {
        total += scores[playerIndex][i];
      } else if (scores[playerIndex][i] > 0) {
        total = Math.ceil(total * 1.5) + scores[playerIndex][i];
      }
    }
    const newTotals = [...totalScores];
    newTotals[playerIndex] = newIsNeg ? -total : total;
    setTotalScores(newTotals);
  };

  const kickHalf = (playerIndex) => {
    const newTotals = [...totalScores];
    if (newTotals[playerIndex] < 0) {
      newTotals[playerIndex] = Math.ceil(newTotals[playerIndex] / 2);
    } else {
      newTotals[playerIndex] = Math.floor(newTotals[playerIndex] / 2);
    }
    setTotalScores(newTotals);
  };

  const clearScore = (playerIndex) => {
    const record = {
      total: totalScores[playerIndex],
      scores: [...scores[playerIndex]],
      isNegative: isNegative[playerIndex]
    };
    const newRecords = [...playerLastRecords];
    newRecords[playerIndex] = record;
    setPlayerLastRecords(newRecords);

    const newTotals = [...totalScores];
    newTotals[playerIndex] = 0;
    setTotalScores(newTotals);

    const newScores = [...scores];
    newScores[playerIndex] = Array(12).fill(0);
    setScores(newScores);

    const newNegative = [...isNegative];
    newNegative[playerIndex] = false;
    setIsNegative(newNegative);
  };

  const normalizeScore = (score, isNeg) => {
    if (score === 0 && isNeg) return '-0';
    return score.toString();
  };

  const updateCheckName = (index, value) => {
    const newNames = [...checkNames];
    newNames[index] = value;
    setCheckNames(newNames);
  };

  const updateCheckInput = (index, value) => {
    const newInputs = [...checkInputs];
    newInputs[index] = value;
    setCheckInputs(newInputs);
  };

  const applyMultiplier = (factor) => {
    const newInputs = checkInputs.map(val => ((parseFloat(val) || 0) * factor).toString());
    setCheckInputs(newInputs);
  };

  const checkSum = checkInputs.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  const showMain = () => {
    setShowSettlement(false);
    setShowRecords(false);
  };

  const showSettlementScreen = () => {
    setShowSettlement(true);
    setShowRecords(false);
    setCheckInputs(['', '', '', '']);
  };

  const showRecordsScreen = () => {
    setShowSettlement(false);
    setShowRecords(true);
  };

  let content;
  let headerTitle = '台灣麻將番數記錄';
  let showSummary = true;

  if (showSettlement) {
    headerTitle = '結算';
    showSummary = false;
    content = (
      <div className="settlement-content">
        <div className="square">
          <div className="player top">
            <input
              type="text"
              value={checkNames[0]}
              onChange={(e) => updateCheckName(0, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={checkInputs[0]}
              onChange={(e) => updateCheckInput(0, e.target.value)}
            />
          </div>
          <div className="player left">
            <input
              type="text"
              value={checkNames[1]}
              onChange={(e) => updateCheckName(1, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={checkInputs[1]}
              onChange={(e) => updateCheckInput(1, e.target.value)}
            />
          </div>
          <div className="player right">
            <input
              type="text"
              value={checkNames[2]}
              onChange={(e) => updateCheckName(2, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={checkInputs[2]}
              onChange={(e) => updateCheckInput(2, e.target.value)}
            />
          </div>
          <div className="player bottom">
            <input
              type="text"
              value={checkNames[3]}
              onChange={(e) => updateCheckName(3, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={checkInputs[3]}
              onChange={(e) => updateCheckInput(3, e.target.value)}
            />
          </div>
          <div className="center">
            <p className={checkSum === 0 ? 'balanced' : checkSum > 0 ? 'positive' : 'negative'}>
              {checkSum === 0 ? '啱數' : checkSum}
            </p>
          </div>
        </div>
        <div className="multipliers">
          <button onClick={() => applyMultiplier(0.5)}>x0.5</button>
          <button onClick={() => applyMultiplier(1)}>x1</button>
          <button onClick={() => applyMultiplier(1.5)}>x1.5</button>
          <button onClick={() => applyMultiplier(2)}>x2</button>
          <button onClick={() => applyMultiplier(3)}>x3</button>
        </div>
      </div>
    );
  } else if (showRecords) {
    headerTitle = '找數前記錄';
    showSummary = false;
    content = (
      <div className="content" style={{ marginTop: `${contentMargin}px` }}>
        <div className="players-container">
          {playerNames.map((name, i) => (
            <div key={i} className="player-card">
              <h2>{name}</h2>
              {playerLastRecords[i] ? (
                <>
                  <h3 className={playerLastRecords[i].isNegative ? 'negative' : 'positive'}>
                    {normalizeScore(playerLastRecords[i].total, playerLastRecords[i].isNegative)}
                  </h3>
                  <div className="inputs">
                    {playerLastRecords[i].scores.map((score, j) => (
                      <div key={j} className="record-entry">{score || ''}</div>
                    ))}
                  </div>
                </>
              ) : (
                <p>無記錄</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="content" style={{ marginTop: `${contentMargin}px` }}>
        <div className="players-container">
          {playerNames.map((name, i) => (
            <div key={i} className="player-card">
              <div className="inputs">
                {scores[i].map((score, j) => (
                  <input
                    key={j}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={score || ''}
                    onChange={(e) => updateScore(i, j, e.target.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header fixed-header" ref={headerRef}>
        <h1>{headerTitle}</h1>
      </header>
      {showSummary && (
        <div className="fixed-summary" ref={summaryRef} style={{ top: `${summaryTop}px` }}>
          <div className="summary-row">
            {playerNames.map((name, i) => (
              <div key={i} className="summary-card">
                <h2>{name}</h2>
                <h3 className={isNegative[i] ? 'negative' : 'positive'}>
                  {normalizeScore(totalScores[i], isNegative[i])}
                </h3>
                <div className="buttons">
                  <button onClick={() => kickHalf(i)}>劈半</button>
                  <button onClick={() => clearScore(i)}>找數</button>
                  <button
                    onClick={() => toggleSign(i)}
                    className={isNegative[i] ? 'negative-btn' : 'positive-btn'}
                  >
                    +/-
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {content}
      <div className="footer">
        <button onClick={showMain}>番數記錄</button>
        <button onClick={showSettlementScreen}>結算</button>
        <button onClick={showRecordsScreen}>找數前記錄</button>
      </div>
    </div>
  );
}

export default App;