import React from 'react';
import './LevelSelection.css';

interface LevelSelectionProps {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

const LevelSelection: React.FC<LevelSelectionProps> = ({ onSelectLevel, onBack }) => {
  const levels = Array.from({ length: 60 }, (_, i) => i + 1);

  return (
    <div className="level-selection">
      <div className="level-selection-header">
        <button
          className="back-arrow-button"
          onClick={onBack}
          aria-label="Вернуться назад"
        >
          ←
        </button>
        <h1 className="level-selection-title">Выберите уровень</h1>
      </div>
      <div className="levels-grid">
        {levels.map((level) => (
          <button
            key={level}
            className="level-button"
            onClick={() => onSelectLevel(level)}
            aria-label={`Уровень ${level}`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelection;