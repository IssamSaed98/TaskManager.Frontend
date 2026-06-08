import { useEffect, useRef, useCallback } from 'react'

export const usePolling = (callback, interval = 5000, enabled = true) => {
  const callbackRef = useRef(callback)
  const timerRef = useRef(null)
  const isOnline = useRef(navigator.onLine)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const handleOnline = () => { isOnline.current = true }
    const handleOffline = () => { isOnline.current = false }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const tick = async () => {
      if (!isOnline.current) return
      try {
        await callbackRef.current()
      } catch { }
    }

    timerRef.current = setInterval(tick, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [interval, enabled])
}