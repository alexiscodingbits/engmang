'use client'

import { useState } from 'react'
import type { Post } from './types'
import { NOTE_TAGS } from '@/lib/modules'

type ModuleContext = {
  moduleCode: string
  moduleYear: number
  section: string
} | null

interface Props {
  onClose: () => void
  onCreated: (post: Post) => void
  moduleContext?: ModuleContext
}

export default function CreatePostModal({ onClose, onCreated, moduleContext }: Props) {
  const isGeneralFeed = !moduleContext
  const isNotes = moduleContext?.section === 'NOTES'

  const [postBody, setPostBody] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [noteTag, setNoteTag] = useState('')

  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadedName, setImageUploadedName] = useState('')

  const [fileUploading, setFileUploading] = useState(false)
  const [fileUploadedName, setFileUploadedName] = useState('')

  const anyUploading = imageUploading || fileUploading

  async function uploadFile(
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
    setName: (n: string) => void,
  ) {
    setUploading(true)
    setError('')
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
      if (!putRes.ok) throw new Error('Upload to storage failed')

      setUrl(publicUrl)
      setName(file.name)
    } catch {
      setError('File upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (isGeneralFeed) {
      if (!postBody.trim()) { setError('Write something before posting'); return }
    } else {
      if (!title.trim()) { setError('Title is required'); return }
      if (isNotes && !noteTag) { setError('Please select a tag for this note'); return }
    }

    if (anyUploading) { setError('Please wait for the upload to finish'); return }

    setSubmitting(true)

    const payload: Record<string, unknown> = isGeneralFeed
      ? {
          title: postBody.slice(0, 200),
          type: 'TEXT',
          imageUrl: imageUrl || undefined,
          linkUrl: linkUrl.trim() || undefined,
          fileUrl: fileUrl || undefined,
          isAnonymous,
        }
      : {
          title,
          postBody: postBody.trim() || undefined,
          type: 'TEXT',
          imageUrl: imageUrl || undefined,
          linkUrl: linkUrl.trim() || undefined,
          fileUrl: fileUrl || undefined,
          noteTag: isNotes ? noteTag : undefined,
          moduleCode: moduleContext!.moduleCode,
          moduleYear: moduleContext!.moduleYear,
          section: moduleContext!.section,
        }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      onCreated(await res.json())
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
    setSubmitting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-slate-900 dark:text-zinc-100 font-semibold text-base">
            {moduleContext ? 'Post to Module' : 'Create Post'}
          </h2>
          <button onClick={onClose} className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {isGeneralFeed ? (
            <>
              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                maxLength={1000}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-zinc-200 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />

              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Add a link (optional)"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-zinc-200 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-3">
                <UploadButton
                  accept="image/*"
                  label="Upload Image"
                  icon="🖼️"
                  uploading={imageUploading}
                  uploaded={!!imageUrl}
                  uploadedName={imageUploadedName}
                  onChange={(file) =>
                    uploadFile(file, setImageUrl, setImageUploading, setImageUploadedName)
                  }
                />
                <UploadButton
                  accept=".pdf"
                  label="Upload PDF"
                  icon="📄"
                  uploading={fileUploading}
                  uploaded={!!fileUrl}
                  uploadedName={fileUploadedName}
                  onChange={(file) =>
                    uploadFile(file, setFileUrl, setFileUploading, setFileUploadedName)
                  }
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 accent-emerald-500"
                />
                <span className="text-sm text-slate-500 dark:text-zinc-400">Post anonymously</span>
              </label>
            </>
          ) : (
            <>
              {isNotes && (
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-zinc-200"
                >
                  <option value="" disabled className="text-slate-400 dark:text-zinc-500">Select a tag…</option>
                  {NOTE_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-zinc-200 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />

              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Description (optional)…"
                rows={3}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-zinc-200 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />

              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Link URL (optional)"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-zinc-200 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-3">
                <UploadButton
                  accept="image/*"
                  label="Upload Image"
                  icon="🖼️"
                  uploading={imageUploading}
                  uploaded={!!imageUrl}
                  uploadedName={imageUploadedName}
                  onChange={(file) =>
                    uploadFile(file, setImageUrl, setImageUploading, setImageUploadedName)
                  }
                />
                <UploadButton
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  label="Upload File"
                  icon="📄"
                  uploading={fileUploading}
                  uploaded={!!fileUrl}
                  uploadedName={fileUploadedName}
                  onChange={(file) =>
                    uploadFile(file, setFileUrl, setFileUploading, setFileUploadedName)
                  }
                />
              </div>
            </>
          )}

          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                anyUploading ||
                (isGeneralFeed ? !postBody.trim() : !title.trim())
              }
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-sm font-semibold transition-colors"
            >
              {anyUploading ? 'Uploading…' : submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UploadButton({
  accept,
  label,
  icon,
  uploading,
  uploaded,
  uploadedName,
  onChange,
}: {
  accept: string
  label: string
  icon: string
  uploading: boolean
  uploaded: boolean
  uploadedName: string
  onChange: (file: File) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }
  function handleDragLeave() {
    setDragOver(false)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onChange(file)
  }

  return (
    <label
      className="flex-1 cursor-pointer"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
      />
      <div
        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          dragOver
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : uploaded
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : uploading
            ? 'border-slate-300 dark:border-zinc-600 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-400'
            : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
        }`}
      >
        <span>{uploading ? '⏳' : uploaded ? '✅' : dragOver ? '📥' : icon}</span>
        <span className="truncate max-w-[120px]">
          {uploading ? 'Uploading…' : uploaded ? uploadedName : dragOver ? 'Drop here' : label}
        </span>
      </div>
    </label>
  )
}
