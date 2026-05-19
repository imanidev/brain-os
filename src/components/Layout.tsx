import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import FloatingTimer from './FloatingTimer'

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
      <FloatingTimer />
    </div>
  )
}
