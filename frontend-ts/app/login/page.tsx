import { Button } from "@/components/ui/button";
import Messages from "./messages";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Login() {
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex flex-row gap-1 items-center">
                        Log In / Sign Up to Parakeet AI
                        <Sparkles size={16} fill="black" />
                    </CardTitle>
                    <CardDescription>
                        Log into your Parakeet AI account to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {/* <GoogleOAuth />
                    <Separator /> */}
                    <form
                        className="flex-1 flex flex-col w-full justify-center gap-4"
                        action="/auth/sign-in"
                        method="post"
                    >
                        <Label className="text-md" htmlFor="email">
                            Email
                        </Label>
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border"
                            name="email"
                            placeholder="you@example.com"
                            required
                        />
                        <Button variant="secondary">Continue with email</Button>
                        <Messages />
                    </form>
                </CardContent>
                {/* <CardFooter>
                    <p className="text-sm">
                        By signing up, you agree to our{" "}
                        <a href="/terms" className="underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </CardFooter> */}
            </Card>
        </div>
    );
}
