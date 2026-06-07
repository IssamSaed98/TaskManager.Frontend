import { useEffect, useRef, useCallback } from 'react'

export const usePolling = (callback, interval = 5000, enabled = true) => {
  const callbackRef = useRef(callback)
  const timerRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const tick = async () => {
      await callbackRef.current()
    }

    timerRef.current = setInterval(tick, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [interval, enabled])
}