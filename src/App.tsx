import { Routes, Route, Navigate } from 'react-router-dom'
import CorkBoard from '@/components/Board/CorkBoard'
import ParticipantForm from '@/components/Mobile/ParticipantForm'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/board/demo" replace />} />
      <Route path="/board/:sessionId" element={<CorkBoard />} />
      <Route path="/join/:sessionId" element={<ParticipantForm />} />
    </Routes>
  )
}
