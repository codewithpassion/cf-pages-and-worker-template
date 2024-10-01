import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/components/AuthProvider";
import { Ref, useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LoginValidating } from "./login.validating";

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image.";

export function Login() {
  const email: Ref<HTMLInputElement> = useRef(null);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  const { login, isAuthenticated, navigate } = useAuth();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchToken = searchParams.get("token");
    if (searchToken) {
      console.log("token", searchToken);
      setToken(searchToken);
      setValidating(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      const savedEmail = localStorage.getItem("userEmail");
      if (savedEmail) {
        setEmailAddress(savedEmail);
      }
    }
  }, [isAuthenticated, navigate]);

  const onLogin = async () => {
    if (email?.current?.value) {
      try {
        setLoading(true);
        setInvalid(false);
        const res = await login(email.current.value);
        if (res.ok) {
          setLoginSuccess(true);
          localStorage.setItem("userEmail", email.current.value);
        } else {
          setInvalid(true);
          email.current.select();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                defaultValue=""
                required
                ref={email}
                value={emailAddress}
              />
            </div>
            {/* <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div> */}
            <Button
              type="submit"
              className="w-full"
              onClick={onLogin}
              disabled={loading}
            >
              Login
            </Button>
            {/* <Button variant="outline" className="w-full">
              Login with Google
            </Button> */}
          </div>
          <div className="mt-4 text-center text-sm">
            {loginSuccess && (
              <p className="text-green-500 text-xl font-semibold">
                Success, please check your email!
              </p>
            )}
            {invalid && <p className="text-red-500 text-xl">Invalid login!</p>}
            {/* Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link> */}
          </div>
        </div>
      </div>
      <LoginValidating open={validating} token={token} />
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080?text=L"
          alt="Image"
          width={1920}
          height={1080}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
