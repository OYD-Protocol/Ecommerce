import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Analytics = ({ token }) => {
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: 'all',
    days: 7
  });

  const actionLabels = {
    product_view: "Product View",
    product_search: "Product Search", 
    add_to_cart: "Add to Cart",
    remove_from_cart: "Remove from Cart",
    place_order: "Place Order",
    user_login: "User Login",
    user_register: "User Registration"
  };

  const fetchAnalytics = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filters.action !== 'all') {
        params.append('action', filters.action);
      }

      const response = await axios.get(`${backendUrl}/api/analytics/data?${params}`, {
        headers: { token }
      });

      if (response.data.success) {
        setAnalytics(response.data.analytics);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      toast.error("Failed to fetch analytics data");
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/analytics/summary?days=${filters.days}`, {
        headers: { token }
      });

      if (response.data.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      toast.error("Failed to fetch analytics summary");
      console.error("Summary fetch error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchSummary();
    }
  }, [token, filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      product_view: "bg-blue-100 text-blue-800",
      product_search: "bg-green-100 text-green-800",
      add_to_cart: "bg-yellow-100 text-yellow-800",
      remove_from_cart: "bg-red-100 text-red-800", 
      place_order: "bg-purple-100 text-purple-800",
      user_login: "bg-indigo-100 text-indigo-800",
      user_register: "bg-pink-100 text-pink-800"
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  if (loading && !analytics.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Analytics</h1>
        <p className="text-gray-600">Track user interactions and behavior patterns</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Actions</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.totalActions}</p>
            <p className="text-sm text-gray-500">Last {filters.days} days</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Unique Users</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.uniqueUsersCount}</p>
            <p className="text-sm text-gray-500">Active users</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Top Action</h3>
            <p className="text-2xl font-bold text-gray-900">
              {summary.actionStats[0] ? actionLabels[summary.actionStats[0]._id] : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {summary.actionStats[0]?.count || 0} times
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg. Daily Actions</h3>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(summary.totalActions / filters.days)}
            </p>
            <p className="text-sm text-gray-500">Per day</p>
          </div>
        </div>
      )}

      {/* Action Stats */}
      {summary && summary.actionStats.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Action Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.actionStats.map((stat) => (
              <div key={stat._id} className="text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(stat._id)}`}>
                  {actionLabels[stat._id]}
                </div>
                <p className="text-lg font-bold mt-2">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Actions</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={filters.days}
              onChange={(e) => setFilters({...filters, days: parseInt(e.target.value)})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent User Actions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.userName || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.userEmail || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(item.action)}`}>
                      {actionLabels[item.action]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.productName && (
                        <div><strong>Product:</strong> {item.productName}</div>
                      )}
                      {item.searchTerm && (
                        <div><strong>Search:</strong> "{item.searchTerm}"</div>
                      )}
                      {item.quantity && (
                        <div><strong>Quantity:</strong> {item.quantity}</div>
                      )}
                      {item.orderValue && (
                        <div><strong>Value:</strong> ${item.orderValue}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchAnalytics(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchAnalytics(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {analytics.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No analytics data found.</p>
          <p className="text-gray-400">User interactions will appear here once users start using the app.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
