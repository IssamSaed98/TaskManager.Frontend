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
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    } catch { }
  }

  const subscribe = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // طلب إذن الإشعارات
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      // جيب المفتاح العام من الباك اند
      const res = await axios.get(`${BASE_URL}/notifications/vapid-public-key`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const publicKey = res.data.publicKey

      // سجّل Service Worker
      const reg = await navigator.serviceWorker.ready

      // اشترك في Push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      const subJson = sub.toJSON()

      // أرسل للباك اند
      await axios.post(`${BASE_URL}/notifications/subscribe`, {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setIsSubscribed(true)
      console.log('✅ Push notifications enabled')
    } catch (err) {
      console.error('Subscribe error:', err)
    }
  }

  const unsubscribe = async () => {
    try {
      const token = localStorage.getItem('token')
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        await axios.delete(`${BASE_URL}/notifications/unsubscribe`, {
          data: { endpoint: sub.endpoint },
          headers: { Authorization: `Bearer ${token}` }
        })
        await sub.unsubscribe()
        setIsSubscribed(false)
      }
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }

  return { isSubscribed, isSupported, permission, subscribe, unsubscribe }
}