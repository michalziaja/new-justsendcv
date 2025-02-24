import { Clerk } from "@clerk/chrome-extension"
const clerk = new Clerk({
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  syncHost: "http://localhost:3000"
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_SESSION') {
    clerk.getSession()
      .then(session => {
        sendResponse({ 
          status: session ? 'authenticated' : 'unauthenticated',
          email: session?.user.primaryEmailAddress?.emailAddress
        })
      })
      .catch(() => sendResponse({ status: 'error' }))
    return true
  }
})
