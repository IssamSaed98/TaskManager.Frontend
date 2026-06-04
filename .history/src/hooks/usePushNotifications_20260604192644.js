import { useState, useEffect } from 'react'
import axios from 'axios'

const BASE_URL = 'https://taskmanager-api-issam-avafg0fphpe8bqbb.germanywestcentral-01.azurewebsites.net/api'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      // ننتظر جاهزية الـ Service Worker أولاً
      const reg = await navigator.serviceWorker.ready
      if (reg && reg.pushManager) {
        const sub = await reg.pushManager.getSubscription()
        setIsSubscribed(!!sub)
      }
    } catch (err) {
      console.error('Check subscription error:', err)
    }
  }

  const subscribe = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) return

      // 1. طلب إذن الإشعارات بشكل صريح (ضروري للهواتف والآيفون PWA)
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('Notification permission denied by user')
          return
        }
      }

      // 2. جلب مفتاح الـ VAPID من سيرفر Azure
      const res = await axios.get(`${BASE_URL}/notifications/vapid-public-key`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const publicKey = res.data.publicKey

      // 3. تأمين جلب الـ Service Worker النشط وتفادي خطأ (no active Service Worker)
      let reg = await navigator.serviceWorker.ready

      // إذا لم يكن السيرفس وركر نشطاً، نبحث عنه في التسجيلات الحالية لتفعيله فوراً
      if (!reg || !reg.active) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        reg = registrations.find(r => r.active) || reg
      }

      if (!reg || !reg.active) {
        throw new Error('الـ Service Worker لم يتم تفعيله ونشره بالكامل بعد، يرجى تحديث الصفحة وحفظ الكاش.')
      }

      // 4. عمل الاشتراك الفعلي من خلال الـ PushManager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      const subJson = sub.toJSON()

      // 5. إرسال مفاتيح التشفير والـ Endpoint إلى السيرفر الخاص بك
      await axios.post(`${BASE_URL}/notifications/subscribe`, {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setIsSubscribed(true)
      console.log('Push subscription successful!')
    } catch (err) {
      console.error('Subscribe error:', err)
    }
  }

  const unsubscribe = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      let reg = await navigator.serviceWorker.ready

      if (!reg || !reg.active) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        reg = registrations.find(r => r.active) || reg
      }

      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await axios.delete(`${BASE_URL}/notifications/unsubscribe`, {
            data: { endpoint: sub.endpoint },
            headers: { Authorization: `Bearer ${token}` }
          })
          await sub.unsubscribe()
          setIsSubscribed(false)
          console.log('Push unsubscription successful!')
        }
      }
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }

  return { isSubscribed, isSupported, subscribe, unsubscribe }
}