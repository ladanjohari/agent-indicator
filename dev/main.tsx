import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Workbench } from './Workbench'
import './dev.css'

// This file is the local workbench only. It is never published.
// It finds the empty <div id="root"> in index.html and hands React the page.
const root = document.getElementById('root')
if (!root) throw new Error('No #root element found in index.html')

createRoot(root).render(
  <StrictMode>
    <Workbench />
  </StrictMode>,
)
