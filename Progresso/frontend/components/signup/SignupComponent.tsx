"use client"

import Image from "next/image";
import signUpSVG from './Sign up-cuate.svg'
import Link from "next/link";
import { Input } from "../ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const SignUpComponent = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const handleGoogleSignUp = () => {
    setLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google/dashboard`;
  }

  const validateInputs = () => {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
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
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signup`, {
        name,
        email,
        password,
      });

      // Redirect on successful signup
      router.push('/signin');
    } catch (err) {
      // Axios error handling
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to sign up';
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
    <div className="min-h-screen dark:bg-neutral-800 bg-gray-100 text-gray-900 flex justify-center items-center px-4 ">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-2xl flex justify-center items-center flex-1 rounded-xl">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 w-full justify-center items-center ">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Sign up
            </h1>
            <div className="w-full flex-1 mt-8">
              <div className="flex flex-col items-center">
                <button
                  className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-azure-radiance-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                  onClick={handleGoogleSignUp}>
                  <div className="bg-white p-2 rounded-full">
                    <svg className="w-4" viewBox="0 0 533.5 544.3">
                      <path
                        d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                        fill="#4285f4" />
                      <path
                        d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                        fill="#34a853" />
                      <path
                        d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                        fill="#fbbc04" />
                      <path
                        d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                        fill="#ea4335" />
                    </svg>
                  </div>
                  <span className="ml-4">
                    Sign Up with Google
                  </span>
                </button>
              </div>

              <div className="my-12 border-b text-center">
                <div
                  className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign up with e-mail
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mx-auto max-w-xs flex flex-col gap-4 w-full justify-center items-center">
                <Input
                  className="w-full px-8 py-6 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="text" 
                  placeholder="Name" 
                  value={name}
                  onChange={handleName} 
                />
                <Input
                  className="w-full px-8 py-6 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={handleEmail}
                />
                <Input
                  className="w-full px-8 py-6 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={handlePassword}
                />
                <button
                  className="mt-5 tracking-wide font-semibold bg-azure-radiance-950 text-gray-100 w-full py-4 rounded-lg hover:bg-azure-radiance-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  onClick={handleSubmit}>
                  <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-3">
                    Sign Up
                  </span>
                </button>
                <h5>Already have an account? <Link href={'/signin'} className="underline">Sign In</Link></h5>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  I agree to abide by Progresso&apos;s <Link href={'#'} className="font-bold underline">Terms of Service</Link> and its <Link href={'#'} className="font-bold underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center hidden lg:flex w-full justify-center items-center">
          <div className="m-12 xl:m-16 w-full justify-center items-center bg-contain bg-center bg-no-repeat">
            <Image src={signUpSVG} alt="Sign Up Illustration" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpComponent;