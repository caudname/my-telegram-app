import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onSelectLevel: () => void;
  onExit: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectLevel, onExit }) => {
  return (
    <div className="main-menu">
      <h1 className="main-menu-title">Добро пожаловать!</h1>
      <div className="main-menu-buttons">
        <button 
          className="main-menu-button select-level-button" 
          onClick={onSelectLevel}
          aria-label="Выбрать уровень"
        >
          Выбрать уровень
        </button>
        <button 
          className="main-menu-button exit-button" 
          onClick={onExit}
          aria-label="Выйти из приложения"
        >
          Выход
        </button>
      </div>
    </div>
  );
};

export default MainMenu;