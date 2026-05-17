import { NavLink } from 'react-router-dom'

const ROUTES = [
  { path: '/', label: 'Anchor' },
  { path: '/confidence', label: 'Achievements' },
  { path: '/identity', label: 'Identity' },
  { path: '/thoughts', label: 'Thoughts' },
  { path: '/distractions', label: 'Distractions' },
  { path: '/timer', label: 'Timer' },
]

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">brain-os</h2>
      </div>
      <div className="sidebar-nav">
        {ROUTES.map(route => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-label">{route.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
