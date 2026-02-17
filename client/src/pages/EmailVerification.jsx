import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

export const EmailVerificationPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState("loading");

    const token = searchParams.get("token");
    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("error")
                return
            }
            try {
                await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email?token=${token}`, {
                    headers: { 'Content-Type': 'application/json' }
                })
                setStatus("success")
            } catch (error) {
                console.error("Verification failed", error);
                setStatus("error")
            }
        }

        verifyEmail()
    })
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">

                    {/*  LOADING */}
                    {status === "loading" && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
                            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
                            <p className="mt-2 text-gray-600">Please wait while we confirm your identity.</p>
                        </div>
                    )}

                    {/*  SUCCESS */}
                    {status === "success" && (
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                            <p className="mt-2 text-gray-600">Your account has been successfully verified.</p>

                            <button
                                onClick={() => navigate('/login')}
                                className="mt-8 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium shadow-md"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {/*  ERROR */}
                    {status === "error" && (
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                            <p className="mt-2 text-gray-600">The link is invalid or has expired.</p>

                            <button
                                onClick={() => navigate('/login')}
                                className="mt-8 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
