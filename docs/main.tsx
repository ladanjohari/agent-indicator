import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Docs } from './Docs'
import './docs.css'

const root = document.getElementById('root')
if (!root) throw new Error('No #root element found in index.html')

createRoot(root).render(
  <StrictMode>
    <Docs />
  </StrictMode>,
)
