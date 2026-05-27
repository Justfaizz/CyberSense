import { redirect } from "next/navigation";

// Root "/" → middleware handles redirect to /login or /user/home
// This is just a fallback in case middleware doesn't catch it
export default function RootPage() {
  redirect("/login");
}
