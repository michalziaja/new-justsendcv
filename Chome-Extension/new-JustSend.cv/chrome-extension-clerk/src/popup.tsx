import { ClerkProvider, useClerk } from "@clerk/chrome-extension"
import { useEffect } from "react"

const Popup = () => {
  const { session } = useClerk()

  useEffect(() => {
    chrome.runtime.sendMessage({
      type: 'SESSION_UPDATE',
      status: session?.status || 'unauthenticated'
    })
  }, [session])

  return (
    <div style={{ width: 300, padding: 16 }}>
      {session?.status === 'active' ? (
        <p style={{ color: 'green' }}>
          Status: Zalogowany jako {session?.user.primaryEmailAddress?.emailAddress}
        </p>
      ) : (
        <p style={{ color: 'red' }}>Status: Niezalogowany</p>
      )}
    </div>
  )
}

export const getDefaultPopup = () => (
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    syncHost="http://localhost:3000"
  >
    <Popup />
  </ClerkProvider>
)
