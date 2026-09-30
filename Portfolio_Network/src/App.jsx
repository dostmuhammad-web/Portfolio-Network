import AppProvider from './store/AppProvider'
import AppShell from './components/AppShell'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/pages.css'

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}