import { useEffect, useState } from 'react'
import { Example } from './components/Example'
import { GridDnD } from './components/GridDnD'
import WebApp from '@twa-dev/sdk'
import './App.css'
import { GridDnDExample } from './components/GridDnDExample'

export const App = () => {
  const [ count, setCount ] = useState(0)

  useEffect(() => {
    WebApp.ready(); // Говорим Telegram, что приложение загружено
    WebApp.expand(); // Расширить на весь экран (необязательно)
  }, []);

  return (
    <div id={ 'container' }>
      <button onClick={ () => WebApp.close() }>Закрыть</button>
      <h1>Vite + React</h1>
      <div style={ { display: 'flex', columnGap: '16px' } }>
        <button onClick={ () => setCount((count) => count + 1) }>
          count is { count }
        </button>
      </div>
      <div className={ 'example' }>
        <Example />
      </div>
      <div className={ 'example' }>
        <GridDnD />
      </div>
      <div className={ 'example' }>
        <GridDnDExample />
      </div>
    </div>
  )
}