import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import favicon from './assets/images/symbol.svg'

// Set favicon programmatically
const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
if (link) {
  link.href = favicon;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
