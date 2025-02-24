chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkLoginStatus") {
      // Pobierz dane użytkownika z Clerk
      const user = window.__clerk?.user;
      
      if (user) {
        sendResponse({
          isLoggedIn: true,
          userData: {
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl
          }
        });
      } else {
        sendResponse({
          isLoggedIn: false,
          userData: null
        });
      }
    }
    return true;
  });
  