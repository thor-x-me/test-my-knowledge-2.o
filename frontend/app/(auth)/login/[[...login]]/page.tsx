import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex mx-auto justify-center-safe items-center w-full h-screen">
      <SignIn path="/login" />
    </div>
  );
}
