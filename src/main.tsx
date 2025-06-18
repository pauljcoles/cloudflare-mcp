import React from 'react'
import ReactDOM from 'react-dom/client'
import MCPAmazonQApp from '../mcp-app'

console.log('Rendering app...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MCPAmazonQApp />
  </React.StrictMode>,
)