'use client'

import { useState, useEffect, useRef } from 'react'
import Pusher from 'pusher-js'
import ContactsSidebar from './ContactsSidebar'
import ConversationPanel from './ConversationPanel'

export interface Contact {
  id: string
  name: string
  year: number
  linkedInUrl?: string | null
}

export interface Message {
  id: string
  body: string | null
  fileUrl: string | null
  senderId: string
  receiverId: string
  createdAt: string
  sender: { name: string }
}

interface Props {
  currentUserId: string
  currentUserYear: number
  initialContact?: Contact | null
}

export default function MessagesClient({ currentUserId, currentUserYear, initialContact }: Props) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(initialContact ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const selectedContactRef = useRef<Contact | null>(null)

  // Keep ref in sync so the Pusher handler always sees the current contact
  useEffect(() => {
    selectedContactRef.current = selectedContact
  }, [selectedContact])

  // Subscribe to the current user's Pusher channel for incoming messages
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`user-${currentUserId}`)

    channel.bind('message-received', (message: Message) => {
      const current = selectedContactRef.current
      if (current && message.senderId === current.id) {
        setMessages((prev) => [...prev, message])
      }
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user-${currentUserId}`)
      pusher.disconnect()
    }
  }, [currentUserId])

  // Load conversation history whenever the selected contact changes
  useEffect(() => {
    if (!selectedContact) {
      setMessages([])
      return
    }
    setLoadingMessages(true)
    fetch(`/api/messages?with=${selectedContact.id}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false))
  }, [selectedContact])

  async function sendMessage(body: string, fileUrl?: string) {
    if (!selectedContact || (!body.trim() && !fileUrl)) return
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: selectedContact.id, body: body || undefined, fileUrl }),
    })
    if (res.ok) {
      const message: Message = await res.json()
      setMessages((prev) => [...prev, message])
    }
  }

  return (
    <>
      <ContactsSidebar
        currentUserYear={currentUserYear}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
      />
      <ConversationPanel
        currentUserId={currentUserId}
        contact={selectedContact}
        messages={messages}
        loading={loadingMessages}
        onSendMessage={sendMessage}
      />
    </>
  )
}
