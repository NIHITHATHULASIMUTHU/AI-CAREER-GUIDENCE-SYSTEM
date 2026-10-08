import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { CareerGuidanceSystem } from "./CareerGuidanceSystem";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">AI Career Guidance</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">AI Career Guidance System</h1>
        <Authenticated>
          <p className="text-xl text-secondary">
            Welcome back, {loggedInUser?.email ?? "friend"}! Let's find your perfect career path.
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-secondary">Sign in to get personalized career recommendations</p>
        </Unauthenticated>
      </div>

      <Authenticated>
        <CareerGuidanceSystem />
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
