'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Contact, Message } from './MessagesClient'

interface Props {
  currentUserId: string
  contact: Contact | null
  messages: Message[]
  loading: boolean
  onSendMessage: (body: string, fileUrl?: string) => Promise<void>
}

function getFileType(url: string): 'image' | 'pdf' | 'other' {
  const lower = url.toLowerCase().split('?')[0]
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(lower)) return 'image'
  if (/\.pdf$/.test(lower)) return 'pdf'
  return 'other'
}

function fileNameFromUrl(url: string): string {
  const part = url.split('?')[0].split('/').pop() ?? 'file'
  return part.replace(/^\d+-/, '') // strip leading timestamp prefix
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

  // File attachment state
  const [attachedFileUrl, setAttachedFileUrl] = useState('')
  const [attachedFileName, setAttachedFileName] = useState('')
  const [attachedFileIsImage, setAttachedFileIsImage] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Drag-over state
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragCounter = useRef(0)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setDraft('')
    setAttachedFileUrl('')
    setAttachedFileName('')
    setAttachedFileIsImage(false)
    setUploadError('')
  }, [contact?.id])

  const uploadFile = useCallback(async (file: File) => {
    setFileUploading(true)
    setUploadError('')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!res.ok) throw new Error('Could not get upload URL')
      const { presignedUrl, publicUrl } = await res.json()

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!putRes.ok) throw new Error('Upload failed')

      setAttachedFileUrl(publicUrl)
      setAttachedFileName(file.name)
      setAttachedFileIsImage(file.type.startsWith('image/'))
    } catch {
      setUploadError('Upload failed — please try again.')
    } finally {
      setFileUploading(false)
    }
  }, [])

  function removeAttachment() {
    setAttachedFileUrl('')
    setAttachedFileName('')
    setAttachedFileIsImage(false)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSend() {
    if ((!draft.trim() && !attachedFileUrl) || sending || fileUploading) return
    setSending(true)
    await onSendMessage(draft.trim(), attachedFileUrl || undefined)
    setDraft('')
    setAttachedFileUrl('')
    setAttachedFileName('')
    setAttachedFileIsImage(false)
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Drag & drop on the messages area
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) setIsDraggingOver(true)
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDraggingOver(false)
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDraggingOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
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

      {/* Messages — drag target */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/80 border-2 border-dashed border-emerald-500 rounded-lg pointer-events-none">
            <div className="text-center">
              <div className="text-3xl mb-2">📎</div>
              <p className="text-emerald-400 font-medium text-sm">Drop to attach</p>
            </div>
          </div>
        )}

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
          const fileType = msg.fileUrl ? getFileType(msg.fileUrl) : null
          const fileName = msg.fileUrl ? fileNameFromUrl(msg.fileUrl) : null

          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                }`}
              >
                {/* Image attachment */}
                {msg.fileUrl && fileType === 'image' && (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                    <img
                      src={msg.fileUrl}
                      alt={fileName ?? 'image'}
                      className="max-h-48 rounded-lg object-cover w-full"
                    />
                  </a>
                )}
                {/* PDF attachment */}
                {msg.fileUrl && fileType === 'pdf' && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 mb-2 text-sm underline underline-offset-2 ${
                      isOwn ? 'text-emerald-100 hover:text-white' : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    <span>📄</span>
                    <span className="truncate">{fileName}</span>
                  </a>
                )}
                {/* Other file */}
                {msg.fileUrl && fileType === 'other' && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 mb-2 text-sm underline underline-offset-2 ${
                      isOwn ? 'text-emerald-100 hover:text-white' : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    <span>📎</span>
                    <span className="truncate">{fileName}</span>
                  </a>
                )}

                {/* Text body */}
                {msg.body && <p className="text-sm break-words">{msg.body}</p>}

                <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-200' : 'text-zinc-500'}`}>
                  {time}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Attachment preview strip (between messages and input) */}
      {(attachedFileUrl || fileUploading || uploadError) && (
        <div className="px-6 py-2 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
          {uploadError ? (
            <p className="text-red-400 text-xs">{uploadError}</p>
          ) : fileUploading ? (
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <span>⏳</span>
              <span>Uploading…</span>
            </div>
          ) : attachedFileIsImage ? (
            <div className="relative inline-block">
              <img
                src={attachedFileUrl}
                alt={attachedFileName}
                className="h-16 w-16 rounded-lg object-cover border border-zinc-700"
              />
              <button
                onClick={removeAttachment}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-700 hover:bg-red-500 text-white text-xs flex items-center justify-center transition-colors leading-none"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs flex items-center gap-1.5">
                <span>📄</span>
                <span className="truncate max-w-[200px]">{attachedFileName}</span>
              </span>
              <button
                onClick={removeAttachment}
                className="text-zinc-500 hover:text-red-400 text-sm transition-colors leading-none"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="px-6 py-4 border-t border-zinc-800 flex-shrink-0">
        <div className="flex gap-3 items-end">
          {/* Paperclip */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={fileUploading}
            className="text-zinc-500 hover:text-zinc-300 disabled:opacity-40 transition-colors flex-shrink-0 pb-3 text-lg"
            title="Attach file"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadFile(file)
            }}
          />

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
            disabled={(!draft.trim() && !attachedFileUrl) || sending || fileUploading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
