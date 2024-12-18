"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/lib/features/auth/authSlice";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export default function SignIn() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  const dispatch = useDispatch();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please enter both email and password.");
      return;
    }

    if (password !== retypePassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    try {
      await dispatch(register({ name, email, password }, router));
      router.push("/signin");
    } catch (error) {
      console.error("Register failed:", error);
      toast.error("Register failed. Please try again.");
    }
  };

  const handleProviderSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);

      const { displayName, email } = result.user;
      const token = await result.user.getIdToken();
      const photoURL = result.user.photoURL;
      const response = await fetch(`/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: displayName,
          email: email,
          password: result.user.uid,
          token,
          provider: "firebase",
          isActive: true,
          role: "provider",
          photo: photoURL,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      if (!data.data || !data.data.email || !data.data.id) {
        throw new Error("Incomplete user data received from the server");
      }

      const payload = {
        currentUser: data.data,
        token: data.token,
        email: data.data.email,
        role: data.data.role,
        provider: "firebase",
        isAuthenticated: true,
      };

      dispatch(authAll(payload));

      if (typeof window !== "undefined") {
        sessionStorage.setItem("currentUser", JSON.stringify(payload.currentUser));
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("email", data.data.email);
        sessionStorage.setItem("role", data.data.role);
      }

      router.push("/signin");
    } catch (error) {
      console.error(`Error signing in with provider:`, error);
      toast.error((error as Error).message || "Registration failed. Please try again.");
    }
  };

  return (
    <section className="flex flex-col items-center min-h-screen bg-white py-4 px-4 sm:px-8">
      <Link href="/main">
        <Image
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d53f44d0b4930bc2c267dce9c30b2f4116e32dc1b203ed76d08054d5180281f8?placeholderIfAbsent=true&apiKey=b728ceb3dbd545adac55a3a07f0354a7"
          alt=""
          className="object-contain mt-3 aspect-square w-[63px]"
          width={63}
          height={63}
        />
      </Link>
      <h2 className="mt-6 text-3xl font-bold leading-none text-center text-slate-800">
        Join our community
      </h2>
      <form
        className="flex flex-col mt-12 w-full max-w-[358px] max-md:mt-10"
        onSubmit={handleSignIn}
      >
        <div className="flex flex-col w-full">
          <label htmlFor="name" className="font-medium text-slate-700">
            Name*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex overflow-hidden gap-2 items-center px-3.5 py-2.5 mt-1.5 w-full bg-white rounded-lg border border-gray-300 border-solid shadow-sm min-h-[46px] text-slate-800"
            placeholder="Please enter your name"
          />
        </div>
        <div className="flex flex-col mt-6 w-full">
          <label htmlFor="email" className="font-medium text-slate-700">
            Email*
          </label>
          <input
            type="email"
            id="email"
            className="flex overflow-hidden gap-2 items-center px-3.5 py-2.5 mt-1.5 w-full bg-white rounded-lg border border-gray-300 border-solid shadow-sm min-h-[46px] text-slate-800"
            placeholder="Please enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col mt-6 w-full">
          <label htmlFor="password" className="font-medium text-slate-700">
            Password*
          </label>
          <input
            type="password"
            id="password"
            className="flex overflow-hidden gap-2 items-center px-3.5 py-2.5 mt-1.5 w-full bg-white rounded-lg border border-gray-300 border-solid shadow-sm min-h-[46px] text-slate-800"
            placeholder="************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col mt-6 w-full">
          <label
            htmlFor="retype-password"
            className="font-medium text-slate-700"
          >
            Retype Password*
          </label>
          <input
            type="password"
            id="retype-password"
            className="flex overflow-hidden gap-2 items-center px-3.5 py-2.5 mt-1.5 w-full bg-white rounded-lg border border-gray-300 border-solid shadow-sm min-h-[46px] text-slate-800"
            placeholder="************"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2 mt-4 w-full text-xs font-medium">
          <div className="flex justify-between items-center text-gray-700">
            <label className="label cursor-pointer flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="checkbox checkbox-primary shrink-0 w-4 h-4 bg-white rounded border border-black border-solid shadow-sm"
              />
              <span className="mx-2">Remember me</span>
            </label>
            <a href="#" className="text-right text-gray-700">
              Forgot your password?
            </a>
          </div>
        </div>
        <button
          type="submit"
          className="self-stretch px-5 py-3 mt-6 text-base font-medium text-white bg-blue rounded-md shadow-md w-full"
        >
          Sign Up
        </button>
        <button
          type="button"
          className="flex gap-2 justify-center items-center px-5 py-3 mt-4 text-base font-medium bg-white rounded-md border border-gray-100 shadow-sm w-full"
          onClick={() => handleProviderSignIn(googleProvider)}
        >
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/58367ad1684e90ebb46e6dd71e7e80b32aae98a0e06ff83bd5b63b2393586283?placeholderIfAbsent=true&apiKey=b728ceb3dbd545adac55a3a07f0354a7"
            alt="Google logo"
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            width={24}
            height={24}
          />
          <span>Sign in with Google</span>
        </button>
        <button
          type="button"
          className="flex gap-2 justify-center items-center px-5 py-2.5 mt-4 text-base font-medium bg-white rounded-md border border-gray-100 shadow-sm w-full"
          onClick={() => handleProviderSignIn(githubProvider)}
        >
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/8173a5b673a4c6a8ab511addf3a1048b5d1d836e91ca4b2ae36cb42a81bc96c6?placeholderIfAbsent=true&apiKey=b728ceb3dbd545adac55a3a07f0354a7"
            alt="GitHub logo"
            className="object-contain shrink-0 self-stretch my-auto aspect-[1.04] w-[27px]"
            width={27}
            height={27}
          />
          <span>Sign in with Github</span>
        </button>
      </form>
      <p className="mt-4 text-xs font-medium leading-5 text-center text-blue-400">
        Already have an account?{" "}
        <a href="/signin" className="text-blue-400">
          Sign In
        </a>
      </p>
    </section>
  );
}
