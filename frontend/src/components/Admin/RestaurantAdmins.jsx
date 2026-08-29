import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import bgimage from "../../assets/default-profile-pic.jpg";

const RestaurantAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [newName, setNewName] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const userId = parseInt(localStorage.getItem("userId"));
  const [errorMessage, setErrorMessage] = useState("");
  const imageUrlCache = useRef({});
  const createdUrls = useRef(new Set());

  const getImageUrlFromBytes = (buffer, id) => {
    if (!buffer?.data) return bgimage;

    if (imageUrlCache.current[id]) return imageUrlCache.current[id];

    const byteArray = new Uint8Array(buffer.data);
    const blob = new Blob([byteArray], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    imageUrlCache.current[id] = url;
    createdUrls.current.add(url);
    return url;
  };

  useEffect(() => {
    return () => {
      createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/restaurants/${restaurantId}/admins`
      );
      if (response.data.success) {
        const toProcessed = (data) =>
          data.map((user) => ({
            ...user,
            imageUrl: getImageUrlFromBytes(user.ProfilePic, user.UserID),
          }));
        setAdmins(toProcessed(response.data.data));
      } else {
        console.error("Error fetching admins:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching admins:", error.message);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [restaurantId]);

  const handleAddAdmin = async () => {
    if (!newName.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/restaurants/${restaurantId}/assign-admin`,
        {
          UserID: parseInt(userId),
          TargetUsername: newName.trim(),
        }
      );

      if (response.data.success) {
        await fetchAdmins();
        setNewName("");
        setErrorMessage("");
        setShowPanel(false);
      } else {
        setErrorMessage(response.data.message || "Failed to assign admin.");
      }
    } catch {
      setErrorMessage("Failed to assign admin.");
    }
  };

  const handleDelete = async (targetUserId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/restaurants/${restaurantId}/remove-admin`,
        {
          UserID: parseInt(userId),
          TargetUserID: parseInt(targetUserId),
        }
      );

      if (response.data.success) {
        await fetchAdmins();
      } else {
        console.error("Failed to remove admin: " + response.data.message);
      }
    } catch (error) {
      console.error("Error removing admin:", error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-theme-brown relative">
      {/* Navigation */}
      <div className="flex gap-4 p-6">
        <Link
          className="bg-white border px-4 py-2 rounded shadow-md hover:bg-gray-100"
          to="/admin/restaurants/details"
        >
          Details
        </Link>
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/admin/restaurants/reviews"
        >
          Reviews
        </Link>
        <Link
          className="bg-theme-pink text-white px-4 py-2 rounded"
          to="/admin/restaurants/admins"
        >
          Admins
        </Link>
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/admin/restaurants/staff"
        >
          Staff
        </Link>
      </div>

      <h2 className="text-2xl font-semibold text-theme-pink px-6 mt-6">
        All Admins
      </h2>

      {/* Admins List */}
      <div className="space-y-3 p-6">
        {admins.map((admin, index) => (
          <div
            key={index}
            className="p-3 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <img
                src={admin.imageUrl || bgimage}
                alt={`${admin.Name}'s Profile`}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex flex-col sm:flex-row sm:space-x-20 text-sm sm:text-base ml-4">
                <span className="font-semibold text-gray-800 min-w-[250px]">
                  {admin.Name}
                </span>
                <span className="text-gray-600 min-w-[350px]">
                  {admin.Email}
                </span>
                <span className="text-gray-600 min-w-[250px]">
                  {admin.PhoneNum}
                </span>
              </div>
            </div>

            {admin.UserID === userId ? (
              <TrashIcon
                className="w-6 h-6 text-gray-300 cursor-not-allowed"
                title="You can't remove yourself"
              />
            ) : (
              <button
                onClick={() => handleDelete(admin.UserID)}
                className="text-red-500 hover:text-red-700 transition"
                title="Remove Admin"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-6 right-6 bg-theme-pink hover:bg-pink-600 text-white p-4 rounded-full shadow-lg transition duration-200 z-50"
        title="Add Admin"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Add Admin Panel */}
      {showPanel && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-2xl rounded-lg z-50 w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
            Add New Admin
          </h2>
          {errorMessage && (
            <p className="text-red-600 text-sm mb-2 text-center">
              {errorMessage}
            </p>
          )}

          <input
            type="text"
            placeholder="Enter admin username"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleAddAdmin}
              className="bg-theme-pink text-white px-4 py-2 rounded hover:bg-pink-600 transition"
            >
              Add
            </button>
            <button
              onClick={() => setShowPanel(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantAdmins;
