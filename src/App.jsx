import React, { useState, useEffect } from 'react';
import './App.css'; // This links to the CSS file

function App() {
  const playerNames = ['上家', '對家', '下家'];
  const [scores, setScores] = useState(playerNames.map(() => Array(6).fill(0)));
  const [totalScores, setTotalScores] = useState([0, 0, 0]);
  const [isNegative, setIsNegative] = useState([false, false, false]);
  const [playerRecords, setPlayerRecords] = useState([null, null, null]);
  const [showRecordsDialog, setShowRecordsDialog] = useState(false);
  const [showCheckDialog, setShowCheckDialog] = useState(false); // State for check dialog
  const [checkNames, setCheckNames] = useState(['玩家1', '玩家2', '玩家3', '玩家4']); // Editable names
  const [checkInputs, setCheckInputs] = useState(['', '', '', '']); // Inputs default to empty strings

  // Load records from localStorage on mount
  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('playerRecords'));
    if (savedRecords) {
      setPlayerRecords(savedRecords);
    }
  }, []);

  // Save records to localStorage on change
  useEffect(() => {
    localStorage.setItem('playerRecords', JSON.stringify(playerRecords));
  }, [playerRecords]);

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
      } else if (currentScores[playerIndex][i] > 0) { // Assuming non-zero means "not empty"
        total = Math.ceil(total * 1.5) + currentScores[playerIndex][i];
      }
    }
    const newTotals = [...totalScores];
    newTotals[playerIndex] = isNegative[playerIndex] ? -total : total;
    setTotalScores(newTotals);
  };

  const toggleSign = (playerIndex) => {
    const newNegative = [...isNegative];
    newNegative[playerIndex] = !newNegative[playerIndex];
    setIsNegative(newNegative);
    calculateTotalScore(playerIndex);
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
    newScores[playerIndex] = Array(6).fill(0);
    setScores(newScores);
  };

  const normalizeScore = (score) => (score === 0 ? '0' : score.toString());

  // Function to update check names
  const updateCheckName = (index, value) => {
    const newNames = [...checkNames];
    newNames[index] = value;
    setCheckNames(newNames);
  };

  // Function to update check inputs (allow empty strings)
  const updateCheckInput = (index, value) => {
    const newInputs = [...checkInputs];
    newInputs[index] = value; // Keep as string, can be empty
    setCheckInputs(newInputs);
  };

  // Compute sum, treating empty as 0
  const checkSum = checkInputs.reduce((acc, val) => acc + (parseInt(val) || 0), 0);

  // Reset function for "番數記錄" button (closes dialogs, optional reset scores if needed)
  const resetMainView = () => {
    setShowRecordsDialog(false);
    setShowCheckDialog(false);
    // Optional: Reset scores if you want a full reset
    // setScores(playerNames.map(() => Array(6).fill(0)));
    // setTotalScores([0, 0, 0]);
    // setIsNegative([false, false, false]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>台灣麻將番數記錄</h1>
      </header>
      <div className="players-container">
        {playerNames.map((name, i) => (
          <div key={i} className="player-card">
            <h2>{name}</h2>
            <h3 className={totalScores[i] >= 0 ? 'positive' : 'negative'}>
              {normalizeScore(totalScores[i])}
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
            <div className="inputs">
              {scores[i].map((score, j) => (
                <input
                  key={j}
                  type="number"
                  min="0"
                  value={score || ''}
                  onChange={(e) => updateScore(i, j, e.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showRecordsDialog && (
        <div className="dialog">
          <h2>玩家記錄</h2>
          {playerNames.map((name, i) => (
            <div key={i}>
              <h3>{name}</h3>
              <p>{playerRecords[i] == null ? '無記錄' : `最新記錄: ${normalizeScore(playerRecords[i])}`}</p>
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
              type="number"
              value={checkInputs[0]}
              onChange={(e) => updateCheckInput(0, e.target.value)}
            />
            <input
              type="text"
              value={checkNames[1]}
              onChange={(e) => updateCheckName(1, e.target.value)}
            />
            <input
              type="number"
              value={checkInputs[1]}
              onChange={(e) => updateCheckInput(1, e.target.value)}
            />
            <input
              type="text"
              value={checkNames[2]}
              onChange={(e) => updateCheckName(2, e.target.value)}
            />
            <input
              type="number"
              value={checkInputs[2]}
              onChange={(e) => updateCheckInput(2, e.target.value)}
            />
            <input
              type="text"
              value={checkNames[3]}
              onChange={(e) => updateCheckName(3, e.target.value)}
            />
            <input
              type="number"
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
          setCheckInputs(['', '', '', '']); // Reset inputs
        }}>埋數</button>
        <button onClick={() => setShowRecordsDialog(true)}>記錄</button>
      </div>
    </div>
  );
}

export default App;