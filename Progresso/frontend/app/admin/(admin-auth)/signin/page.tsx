"use client"

import Image from "next/image";
import Link from "next/link";
import signinSVG from './Mobile login-cuate.svg'
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";

const SigninComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const validateInputs = () => {
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email";
    if (!password.trim()) return "Password is required";
    return null;
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/signin`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      // On successful login, redirect to dashboard
      if(response.data.success){
        router.push('/admin/dashboard');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Invalid credentials';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-white">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-neutral-800 bg-gray-100 text-gray-900 flex justify-center items-center px-4">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-2xl flex justify-center items-center flex-1 rounded-xl">
        <div className="flex-1 text-center hidden lg:flex w-full justify-center items-center">
          <div className="m-12 xl:m-16 w-full justify-center items-center bg-contain bg-center bg-no-repeat">
            <Image src={signinSVG} alt="Sign In Illustration" />
          </div>
        </div>
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 w-full justify-center items-center">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Sign In
            </h1>
            <div className="w-full flex-1 mt-8">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center mx-auto max-w-xs">
                  {error}
                </div>
              )}

              <div className="mx-auto max-w-xs flex flex-col gap-4 w-full justify-center items-center">
                <Input
                  className="w-full px-8 py-6 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmail} />
                <Input
                  className="w-full px-8 py-6 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePassword} />
                <button
                  className="mt-5 tracking-wide font-semibold bg-azure-radiance-950 text-gray-100 w-full py-4 rounded-lg hover:bg-azure-radiance-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  onClick={handleSubmit}>
                  <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                  <span className="ml-3">
                    Sign In
                  </span>
                </button>
                <h5>Don&apos;t have an account? <Link href={'/admin/signup'} className="underline">Sign Up</Link></h5>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  I agree to abide by Progresso&apos;s <Link href={'#'} className="font-bold underline">Terms of Service</Link> and its <Link href={'#'} className="font-bold underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SigninComponent;