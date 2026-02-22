'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import GeneralFeed from './GeneralFeed'
import ModulesSection from './ModulesSection'
import { UserRoleContext, type UserRole } from '@/lib/user-role-context'

const TourGuide = lazy(() => import('./TourGuide'))

type Tab = 'general' | 'modules'

interface Props {
  showTour?: boolean
  userRole?: UserRole
}

export default function FeedClient({ showTour = false, userRole = 'USER' }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [runTour, setRunTour] = useState(false)

  useEffect(() => {
    if (showTour) {
      // Small delay to let the page elements render before starting tour
      const t = setTimeout(() => setRunTour(true), 600)
      return () => clearTimeout(t)
    }
  }, [showTour])

  return (
    <UserRoleContext.Provider value={userRole}>
      <div>
        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          <button
            id="tour-general-feed-tab"
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
            id="tour-modules-tab"
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

        {runTour && (
          <Suspense fallback={null}>
            <TourGuide onDone={() => setRunTour(false)} />
          </Suspense>
        )}
      </div>
    </UserRoleContext.Provider>
  )
}
