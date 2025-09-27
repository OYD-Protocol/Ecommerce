import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import SelfVerificationRegister from "../components/SelfVerificationRegister";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const { token, login, navigate, trackUserAction } = useContext(ShopContext);
  const [currentState, setCurrentState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [dataSharingConsent, setDataSharingConsent] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    try {
      if (currentState === "Sign Up") {
        // Check if verification is required for signup
        if (!isVerified) {
          setShowVerification(true);
          toast.error("Please verify your identity before registering");
          return;
        }

        // User Registration
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          isVerified: true,
          verificationData,
          dataSharingConsent,
        });

        if (response.data.success) {
          toast.success("Registration successful! Please login.");
          // Track registration action
          trackUserAction('user_register');
          setCurrentState("Login");
          setName("");
          setEmail("");
          setPassword("");
          setIsVerified(false);
          setVerificationData(null);
          setDataSharingConsent(false);
        } else {
          toast.error(response.data.message || "Registration failed");
        }
      } else {
        // User Login
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (response.data.success) {
          login(response.data.token);
          toast.success("Login successful!");
          // Track login action
          setTimeout(() => {
            trackUserAction('user_login');
          }, 100);
          navigate("/");
        } else {
          toast.error(response.data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setVerificationData({
      timestamp: new Date().toISOString(),
      method: 'self_protocol',
      status: 'verified'
    });
    setShowVerification(false);
    toast.success("Identity verified successfully!");
  };

  const handleVerificationError = (errorMessage) => {
    setIsVerified(false);
    setVerificationData(null);
    toast.error(errorMessage || "Verification failed");
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="hello@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      {currentState === "Sign Up" && (
        <>
          {/* Self Verification Section */}
          <div className="w-full p-4 border border-blue-200 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Identity Verification Required</h4>
            <p className="text-sm text-blue-600 mb-3">
              Please verify your identity using Self Protocol before registering
            </p>
            {isVerified ? (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Verified via Self Protocol</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVerification(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Verify with Self Protocol
              </button>
            )}
          </div>

          {/* Data Sharing Consent Checkbox */}
          <div className="w-full">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dataSharingConsent}
                onChange={(e) => setDataSharingConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Do you want to earn cashback by sharing your data on OYD dataDAO?
                <br />
                <span className="text-xs text-gray-500">
                  By checking this box, you consent to share data to earn rewards through our data marketplace.
                </span>
              </span>
            </label>
          </div>
        </>
      )}
      <div className="flex justify-between w-full text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create a new account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login here
          </p>
        )}
      </div>
      <button 
        type="submit"
        disabled={currentState === "Sign Up" && !isVerified}
        className={`px-8 py-2 mt-4 font-light text-white transition-colors ${
          currentState === "Sign Up" && !isVerified 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {currentState === "Login" ? "Sign In" : isVerified ? "Register" : "Verify Identity First"}
      </button>

      {/* Self Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowVerification(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-500 hover:text-gray-700 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SelfVerificationRegister 
              onVerificationSuccess={handleVerificationSuccess}
              onVerificationError={handleVerificationError}
            />
          </div>
        </div>
      )}
    </form>
  );
};

export default Login;
