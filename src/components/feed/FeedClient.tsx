'use client'

import { useState } from 'react'
import GeneralFeed from './GeneralFeed'
import ModulesSection from './ModulesSection'

type Tab = 'general' | 'modules'

export default function FeedClient() {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          General Feed
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'modules'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Modules
        </button>
      </div>

      {activeTab === 'general' ? <GeneralFeed /> : <ModulesSection />}
    </div>
  )
}
