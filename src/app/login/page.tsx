import { redirect } from "next/navigation";
import { auth, signIn, ALLOWED_DOMAIN } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sign in // Trenchers Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
              T
            </span>
            <h1 className="mt-4 text-base font-semibold tracking-tight">Trenchers Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Platform access management</p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
            className="mt-6"
          >
            <Button type="submit" variant="outline" className="w-full">
              <GoogleG />
              Sign in with Google
            </Button>
          </form>

          {error && (
            <p className="mt-3 text-center text-xs text-destructive">
              That account can&apos;t sign in. Ask an admin to grant you access.
            </p>
          )}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Restricted to <span className="text-foreground">@{ALLOWED_DOMAIN}</span> accounts
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
