/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from "react";
import { auth } from "../../services/auth";
import type { RegisterData } from "../../types";
import { Lock, Mail, Shield, User } from "lucide-react";
import { Link } from "react-router-dom";
import Error from "../Error";
import Success from "../Success";

export default function Register() {
  const [data, setData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await auth.register(data);
      setSuccess(res.message);
      setData({ name: "", email: "", password: "" });
      if(checkboxRef.current) {
        checkboxRef.current.checked = false;
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-500 mt-2">
                Join thousands of companies using SecureChat
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Error error={error} />}
              {success && <Success success={success} />}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="John Smith"
                      value={data.name}
                      onChange={(e) =>
                        setData({ ...data, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Work Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="you@company.com"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="••••••••"
                      value={data.password}
                      onChange={(e) =>
                        setData({ ...data, password: e.target.value })
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with 1 number and 1 special
                    character
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  ref={checkboxRef}
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link
                to={"/login"}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-6">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  SOC2 Certified
                </span>
              </div>
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  End-to-End Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
