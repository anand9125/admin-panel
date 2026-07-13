import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand";
import { auth, signIn, ALLOWED_DOMAIN } from "@/auth";

export const metadata = { title: "Sign in // Platform Access" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="bg-aurora bg-grid relative flex min-h-screen items-center justify-center px-6">
      <div className="panel w-full max-w-sm rounded-2xl border border-border p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-10 w-auto" />
          <h1 className="mt-4 text-lg font-semibold tracking-tight">
            Trenchers<span className="text-gradient">.AI</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Platform access panel</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="mt-7"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background/60 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GoogleG className="size-4" />
            Sign in with Google
          </button>
        </form>

        {error && (
          <p className="mt-3 text-center text-xs text-accent-red">
            That account can&apos;t sign in. Ask an admin to grant you access.
          </p>
        )}
        <p className="mt-5 text-center text-xs text-muted-faint">
          Restricted to <span className="text-muted">@{ALLOWED_DOMAIN}</span> accounts
        </p>
      </div>
    </div>
  );
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
