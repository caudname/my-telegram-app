import React from 'react';
import './LevelSelection.css';
import levelsData from '../../data/levels.json';
import { type LevelData } from '../GridDnDExample/GridDnDExample';

interface LevelSelectionProps {
  onSelectLevel: (level: LevelData) => void;
  onBack: () => void;
}

const LevelSelection: React.FC<LevelSelectionProps> = ({ onSelectLevel, onBack }) => {
  const levels = levelsData as LevelData[];

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
            key={level.id}
            className="level-button"
            onClick={() => onSelectLevel(level)}
            aria-label={`Уровень ${level.id}`}
          >
            {level.id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelection;