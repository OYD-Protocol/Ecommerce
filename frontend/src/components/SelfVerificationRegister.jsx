import React, { useState, useEffect, useMemo } from "react";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  countries, 
  getUniversalLink,
} from "@selfxyz/qrcode";
import { v4 as uuidv4 } from "uuid";

const SelfVerificationRegister = ({ onVerificationSuccess, onVerificationError }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [selfApp, setSelfApp] = useState(null);
  const [universalLink, setUniversalLink] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("pending"); // "pending", "verifying", "success", "failed"
  const [userId] = useState(() => uuidv4());

  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: import.meta.env.VITE_SELF_APP_NAME || "OYD Ecommerce Verification",
        scope: import.meta.env.VITE_SELF_SCOPE || "oyd-ecommerce",
        endpoint: import.meta.env.VITE_SELF_ENDPOINT || "https://your-ngrok-url.ngrok-free.app/api/verify",
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: "OYD Ecommerce Registration Verification",
        disclosures: {
          minimumAge: 18,
          excludedCountries: excludedCountries,
          name: true,
          nationality: true,
          // Add Aadhaar-like verification
          // document_number: true, // This would be for Aadhaar number if supported
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      setVerificationStatus("failed");
      onVerificationError && onVerificationError("Failed to initialize verification");
    }
  }, [excludedCountries, userId, onVerificationError]);

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, "_blank");
  };

  const handleSuccessfulVerification = () => {
    setVerificationStatus("success");
    onVerificationSuccess && onVerificationSuccess();
  };

  const handleVerificationError = (error) => {
    console.error("Self verification error:", error);
    setVerificationStatus("failed");
    onVerificationError && onVerificationError("Verification failed via Aadhaar");
  };

  if (verificationStatus === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Verification Successful!</h3>
        <p className="text-green-600">Your identity has been verified via Aadhaar. You can now complete registration.</p>
      </div>
    );
  }

  if (verificationStatus === "failed") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Verification Failed</h3>
        <p className="text-red-600 mb-4">User not verified via Aadhaar. Please try again.</p>
        <button
          onClick={() => setVerificationStatus("pending")}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Identity Verification Required</h3>
        <p className="text-blue-600 text-sm">
          Please verify your identity using Self Protocol with Aadhaar to complete registration
        </p>
      </div>

      <div className="flex justify-center mb-6">
        {selfApp ? (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={handleVerificationError}
            />
          </div>
        ) : (
          <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
            <p className="text-gray-500 text-sm">Loading QR Code...</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!universalLink}
          className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {linkCopied ? "Copied!" : "Copy Universal Link"}
        </button>

        <button
          type="button"
          onClick={openSelfApp}
          disabled={!universalLink}
          className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Open Self App
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Don't have the Self app? 
          <a 
            href={universalLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            Download here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SelfVerificationRegister;
