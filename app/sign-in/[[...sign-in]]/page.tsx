import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          layout: {
            logoImageUrl: "/logo.png", // Ścieżka do Twojego logo
          },
          elements: {
            formButtonPrimary: "bg-slate-500 hover:bg-slate-400 text-sm normal-case",
          },
        }}
      />
    </div>
  );
}
