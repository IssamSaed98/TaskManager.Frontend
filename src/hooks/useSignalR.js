import { useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'

const HUB_URL = 'https://taskmanager-api-issam-avafg0fphpe8bqbb.germanywestcentral-01.azurewebsites.net/hubs/tasks'

export const useSignalR = (onEvent) => {
  const connectionRef = useRef(null)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const connect = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    // Task events
    connection.on('TaskAdded', (task) => {
      onEventRef.current?.('TaskAdded', task)
    })

    connection.on('TaskUpdated', (task) => {
      onEventRef.current?.('TaskUpdated', task)
    })

    connection.on('TaskDeleted', (taskId) => {
      onEventRef.current?.('TaskDeleted', taskId)
    })

    // Event events
    connection.on('EventCreated', (ev) => {
      onEventRef.current?.('EventCreated', ev)
    })

    connection.on('EventResponseUpdated', (response) => {
      onEventRef.current?.('EventResponseUpdated', response)
    })

    connection.on('EventApproved', (approval) => {
      onEventRef.current?.('EventApproved', approval)
    })

    try {
      await connection.start()
      console.log('✅ SignalR connected')
      connectionRef.current = connection
    } catch (err) {
      console.error('SignalR connection error:', err)
    }

    return connection
  }, [])

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop()
      connectionRef.current = null
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { connectionRef }
}