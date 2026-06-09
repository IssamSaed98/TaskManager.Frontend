import { useEffect, useRef } from 'react'

export const usePolling = (callback, interval = 8000, enabled = true) => {
  const callbackRef = useRef(callback)
  const timerRef = useRef(null)
  const failCountRef = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const tick = async () => {
      if (!navigator.onLine) return
      try {
        await callbackRef.current()
        failCountRef.current = 0
      } catch (err) {
        failCountRef.current++
        // بعد 3 فشل متتالي وقف لمدة أطول
        if (failCountRef.current >= 3) {
          if (timerRef.current) clearInterval(timerRef.current)
          // حاول مرة ثانية بعد 30 ثانية
          setTimeout(() => {
            failCountRef.current = 0
            timerRef.current = setInterval(tick, interval)
          }, 30000)
        }
      }
    }

    timerRef.current = setInterval(tick, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [interval, enabled])
}