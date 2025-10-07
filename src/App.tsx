import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'
import { GridDnDExample } from './components/GridDnDExample'

export const App = () => {
  useEffect(() => {
    WebApp.ready(); // Говорим Telegram, что приложение загружено
    WebApp.expand(); // Расширить на весь экран (необязательно)
  }, []);

  return (
    <div id={ 'container' }>
      <button onClick={ () => WebApp.close() }>Закрыть</button>
      <div className={ 'example' }>
        <GridDnDExample />
      </div>
    </div>
  )
}