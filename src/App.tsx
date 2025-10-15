import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { GridDnDExample } from './components/GridDnDExample'
import MainMenu from './components/MainMenu/MainMenu';
import LevelSelection from './components/LevelSelection/LevelSelection';
import './App.css'

export const App = () => {
  const [currentView, setCurrentView] = useState<'mainMenu' | 'levelSelection' | 'game'>('mainMenu');

  useEffect(() => {
    WebApp.ready(); // Говорим Telegram, что приложение загружено
    WebApp.expand(); // Расширить на весь экран (необязательно)
  }, []);

  const handleSelectLevel = () => {
    setCurrentView('levelSelection');
  };

  const handleLevelSelect = (level: number) => {
    console.log(`Selected level: ${level}`);
    setCurrentView('game');
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
          <GridDnDExample />
          <button onClick={ handleBackToLevelSelection } style={ { marginTop: '40px' } }>Назад</button>
        </>
      )}
    </div>
  )
}