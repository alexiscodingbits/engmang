'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

interface Props {
  onDone: () => void
}

export default function TourGuide({ onDone }: Props) {
  useEffect(() => {
    async function markTourSeen() {
      await fetch('/api/user/tour', { method: 'POST' })
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'black',
      overlayOpacity: 0.6,
      smoothScroll: true,
      allowClose: true,
      onDestroyStarted: () => {
        markTourSeen()
        onDone()
        driverObj.destroy()
      },
      steps: [
        {
          element: '#tour-navbar',
          popover: {
            title: 'Navigation',
            description: 'Use the navbar to switch between Feed, Messages, and sign out.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-general-feed-tab',
          popover: {
            title: 'General Feed',
            description: 'The General Feed is where everyone shares updates, questions, and resources.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-modules-tab',
          popover: {
            title: 'Modules',
            description: 'Browse posts organised by module — find notes, past papers, and discussions for each subject.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-create-post',
          popover: {
            title: 'Create a Post',
            description: 'Share notes, ask questions, or post links and images with the New Post button.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '.tour-post-card',
          popover: {
            title: 'Post Cards',
            description: 'Vote on posts, leave comments, or bookmark them to read later.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#tour-messages',
          popover: {
            title: 'Messages',
            description: 'Send direct messages to classmates — find them by year in the Messages section.',
            side: 'bottom',
            align: 'end',
          },
        },
      ],
    })

    driverObj.drive()

    return () => {
      driverObj.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
