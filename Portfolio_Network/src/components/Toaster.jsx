import { useEffect, useState } from 'react'
import Icon from './Icon'
import { subscribeToasts } from '../lib/toast'

export default function Toaster() {
  const [items, setItems] = useState([])

  useEffect(() => {
    return subscribeToasts((entry) => {
      setItems((current) => [...current.slice(-2), entry])
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== entry.id))
      }, 2600)
    })
  }, [])

  if (items.length === 0) return null

  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast--${item.tone}`}>
          <Icon name={item.tone === 'error' ? 'close' : 'check'} size={16} />
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  )
}