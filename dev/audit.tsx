import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClipAudit } from './ClipAudit'
import '../src/components/ApprovalGate/ApprovalGate.css'

// Local only, never published. Entry point for clip-audit.html.
const root = document.getElementById('root')
if (!root) throw new Error('No #root element found in clip-audit.html')

createRoot(root).render(
  <StrictMode>
    <ClipAudit />
  </StrictMode>,
)
