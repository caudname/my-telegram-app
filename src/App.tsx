import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { GridDnDExample } from './components/GridDnDExample'
import './App.css'

export const App = () => {
  useEffect(() => {
    WebApp.ready(); // Говорим Telegram, что приложение загружено
    WebApp.expand(); // Расширить на весь экран (необязательно)
  }, []);

  return (
    <div id={ 'container' }>
      <GridDnDExample />
      <button onClick={ () => WebApp.close() } style={ { marginTop: '40px' } }>Закрыть</button>
    </div>
  )
}