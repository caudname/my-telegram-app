import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { GridDnDExample, type LevelData } from './components/GridDnDExample'
import MainMenu from './components/MainMenu/MainMenu';
import LevelSelection from './components/LevelSelection/LevelSelection';
import { Modal } from './components/Modal';
import './App.css'

// Extend the Window interface to include our custom resetGridLevel property
declare global {
  interface Window {
    resetGridLevel?: () => void;
  }
}

export const App = () => {
  const [showHomeConfirmation, setShowHomeConfirmation] = useState(false);
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);
  const [currentView, setCurrentView] = useState<'mainMenu' | 'levelSelection' | 'game'>('mainMenu');
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  useEffect(() => {
    WebApp.ready(); // Говорим Telegram, что приложение загружено
    WebApp.expand(); // Расширить на весь экран (необязательно)
  }, []);

  const handleSelectLevel = () => {
    setCurrentView('levelSelection');
  };

  const handleLevelSelect = (level: LevelData) => {
      setSelectedLevel(level);
      console.log(`Selected level:`, level);
      setCurrentView('game');
    };
  
    // Загружаем уровни для использования в функциях
      const [levels, setLevels] = useState<LevelData[] | null>(null);
    
      useEffect(() => {
        // Загружаем уровни при инициализации приложения
        import('./data/levels.json').then((levelsModule) => {
          const levelsData: LevelData[] = levelsModule.default as LevelData[];
          setLevels(levelsData);
        });
      }, []);
    
      const handleNextLevel = () => {
        if (selectedLevel && levels) {
          const currentIndex = levels.findIndex(l => l.id === selectedLevel.id);
          if (currentIndex !== -1 && currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            setSelectedLevel(nextLevel);
          }
        }
      };
    
      const hasNextLevel = () => {
        if (!selectedLevel || !levels) return false;
        const currentIndex = levels.findIndex(l => l.id === selectedLevel.id);
        return currentIndex !== -1 && currentIndex < levels.length - 1;
      };

  const handleBackToMenu = () => {
    setCurrentView('mainMenu');
  };

  const handleExit = () => {
    WebApp.close();
  };

  return (
    <div id={ 'container' }>
      {currentView === 'mainMenu' && (
        <MainMenu onSelectLevel={handleSelectLevel} onExit={handleExit} />
      )}
      {currentView === 'levelSelection' && (
        <LevelSelection onSelectLevel={handleLevelSelect} onBack={handleBackToMenu} />
      )}
      {currentView === 'game' && (
        <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', rowGap: '20px' } }>
          {selectedLevel && (
            <h2 style={ { margin: '0 0 10px 0' } }>Уровень {selectedLevel.id}</h2>
          )}
          <GridDnDExample ref={ (gridRef) => { window.resetGridLevel = gridRef?.resetLevel } } levelData={selectedLevel} onNextLevel={handleNextLevel} onReturnToMenu={() => setCurrentView('mainMenu')} hasNextLevel={levels ? hasNextLevel() : false} />
          <div style={ { display: 'flex', gap: '10px' } }>
            <button onClick={() => setShowHomeConfirmation(true)}>🏠</button>
            <button onClick={() => setShowRestartConfirmation(true)}>🔄</button>
          </div>
        </div>
      )}
      {/* Модальное окно подтверждения возврата на главную */}
      <Modal
        isOpen={showHomeConfirmation}
        onClose={() => setShowHomeConfirmation(false)}
        title="Подтверждение"
        message="Вы уверены, что хотите вернуться на главную?"
        onConfirm={() => {
          handleBackToMenu();
          setShowHomeConfirmation(false);
        }}
        confirmText="Да"
        cancelText="Нет"
      />
      {/* Модальное окно подтверждения рестарта игры */}
      <Modal
        isOpen={showRestartConfirmation}
        onClose={() => setShowRestartConfirmation(false)}
        title="Подтверждение"
        message="Вы уверены, что хотите начать заново?"
        onConfirm={() => {
          // Рестарт уровня - сброс до начального состояния
          const resetFunction = window.resetGridLevel;
          if (typeof resetFunction === 'function') {
            resetFunction();
          }
          setShowRestartConfirmation(false);
        }}
        confirmText="Да"
        cancelText="Нет"
      />
    </div>
  )
}