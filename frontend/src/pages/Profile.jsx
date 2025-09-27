import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const Profile = () => {
  const { token, userData, navigate } = useContext(ShopContext);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded">{userData.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded">{userData.email}</p>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded">
                  {userData.date ? new Date(userData.date).toLocaleDateString() : "N/A"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
                <p className="text-lg text-green-600 bg-green-50 p-3 rounded font-medium">Active</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate("/orders")}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Orders
              </button>
              
              <button 
                onClick={() => navigate("/collection")}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Shop Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
