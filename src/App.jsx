import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const playerNames = ['上家', '對家', '下家'];
  const [scores, setScores] = useState(playerNames.map(() => Array(12).fill(0)));
  const [totalScores, setTotalScores] = useState([0, 0, 0]);
  const [isNegative, setIsNegative] = useState([false, false, false]);
  const [playerRecords, setPlayerRecords] = useState([null, null, null]);
  const [showRecordsDialog, setShowRecordsDialog] = useState(false);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
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
      // Recompute totals after loading scores
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

    const savedRecords = JSON.parse(localStorage.getItem('playerRecords'));
    if (savedRecords) {
      setPlayerRecords(savedRecords);
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
    localStorage.setItem('playerRecords', JSON.stringify(playerRecords));
  }, [playerRecords]);

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
    const newRecords = [...playerRecords];
    newRecords[playerIndex] = totalScores[playerIndex];
    setPlayerRecords(newRecords);

    const newTotals = [...totalScores];
    newTotals[playerIndex] = 0;
    setTotalScores(newTotals);

    const newScores = [...scores];
    newScores[playerIndex] = Array(12).fill(0);
    setScores(newScores);
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

  const checkSum = checkInputs.reduce((acc, val) => acc + (parseInt(val) || 0), 0);

  const resetMainView = () => {
    setShowRecordsDialog(false);
    setShowCheckDialog(false);
  };

  return (
    <div className="app">
      <header className="app-header fixed-header" ref={headerRef}>
        <h1>台灣麻將番數記錄</h1>
      </header>
      <div className="fixed-summary" ref={summaryRef} style={{ top: `${summaryTop}px` }}>
        <div className="summary-row">
          {playerNames.map((name, i) => (
            <div key={i} className="summary-card">
              <h2>{name}</h2>
              <h3 className={isNegative[i] ? 'negative' : 'positive'}>
                {normalizeScore(totalScores[i], isNegative[i])}
              </h3>
            </div>
          ))}
        </div>
      </div>
      <div className="content" style={{ marginTop: `${contentMargin}px` }}>
        <div className="players-container">
          {playerNames.map((name, i) => (
            <div key={i} className="player-card">
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

      {showRecordsDialog && (
        <div className="dialog">
          <h2>玩家記錄</h2>
          {playerNames.map((name, i) => (
            <div key={i}>
              <h3>{name}</h3>
              <p>{playerRecords[i] == null ? '無記錄' : `最新記錄: ${normalizeScore(playerRecords[i], false)}`}</p>
            </div>
          ))}
          <button onClick={() => setShowRecordsDialog(false)}>關閉</button>
        </div>
      )}

      {showCheckDialog && (
        <div className="dialog">
          <h2>對數</h2>
          <div className="check-inputs">
            <input
              type="text"
              value={checkNames[0]}
              onChange={(e) => updateCheckName(0, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={checkInputs[0]}
              onChange={(e) => updateCheckInput(0, e.target.value)}
            />
            <input
              type="text"
              value={checkNames[1]}
              onChange={(e) => updateCheckName(1, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={checkInputs[1]}
              onChange={(e) => updateCheckInput(1, e.target.value)}
            />
            <input
              type="text"
              value={checkNames[2]}
              onChange={(e) => updateCheckName(2, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={checkInputs[2]}
              onChange={(e) => updateCheckInput(2, e.target.value)}
            />
            <input
              type="text"
              value={checkNames[3]}
              onChange={(e) => updateCheckName(3, e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={checkInputs[3]}
              onChange={(e) => updateCheckInput(3, e.target.value)}
            />
          </div>
          <p className={checkSum === 0 ? 'balanced' : 'unbalanced'}>
            {checkSum === 0 ? '啱數' : '唔啱數'}
          </p>
          <button onClick={() => setShowCheckDialog(false)}>關閉</button>
        </div>
      )}

      <div className="footer">
        <button onClick={resetMainView}>番數記錄</button>
        <button onClick={() => {
          setShowCheckDialog(true);
          setCheckInputs(['', '', '', '']);
        }}>埋數</button>
        <button onClick={() => setShowRecordsDialog(true)}>記錄</button>
      </div>
    </div>
  );
}

export default App;