import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { GridDnDExample, type LevelData } from './components/GridDnDExample'
import MainMenu from './components/MainMenu/MainMenu';
import LevelSelection from './components/LevelSelection/LevelSelection';
import './App.css'

export const App = () => {
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

  const handleBackToLevelSelection = () => {
    setCurrentView('levelSelection');
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
        <>
          <GridDnDExample levelData={selectedLevel} onNextLevel={handleNextLevel} onReturnToMenu={() => setCurrentView('mainMenu')} hasNextLevel={levels ? hasNextLevel() : false} />
          <button onClick={ handleBackToLevelSelection } style={ { marginTop: '40px' } }>Назад</button>
        </>
      )}
    </div>
  )
}