'use client'

import { useState, useEffect, useRef } from 'react'
import type { Contact, Message } from './MessagesClient'

interface Props {
  currentUserId: string
  contact: Contact | null
  messages: Message[]
  loading: boolean
  onSendMessage: (body: string) => Promise<void>
}

export default function ConversationPanel({
  currentUserId,
  contact,
  messages,
  loading,
  onSendMessage,
}: Props) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear draft when switching contacts
  useEffect(() => {
    setDraft('')
  }, [contact?.id])

  async function handleSend() {
    if (!draft.trim() || sending) return
    setSending(true)
    await onSendMessage(draft.trim())
    setDraft('')
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-zinc-600">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-sm">Select a conversation to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-white">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-sm text-white">{contact.name}</div>
          <div className="text-xs text-zinc-500">Year {contact.year}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {loading && (
          <div className="text-center text-zinc-600 text-sm py-8">Loading...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center text-zinc-600 text-sm py-8">
            No messages yet — say hello!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                }`}
              >
                <p className="text-sm break-words">{msg.body}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-200' : 'text-zinc-500'}`}>
                  {time}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-zinc-800 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-600"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
