import React, { useState, useEffect } from "react";
import axios from "axios";
import defaultProfilePic from "../../assets/default-profile-pic.jpg";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm text-theme-brown">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Are you sure you want to delete your account?
        </h2>
        <p className="text-sm mb-6">
          This action cannot be undone. Your data will be permanently removed.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCuisine, setNewCuisine] = useState("");
  const [newFavorite, setNewFavorite] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    old: false,
    new: false,
  });
  const userId = localStorage.getItem("userId");
  const [imageUrl, setImageUrl] = useState(null);
  const [allCuisines, setAllCuisines] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [originalPreferences, setOriginalPreferences] = useState([]);
  const [originalFavorites, setOriginalFavorites] = useState([]);
  const [errors, setErrors] = useState({
    Name: "",
    Username: "",
    PhoneNum: "",
    Email: "",
    password: "",
  });
  const [preview, setPreview] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchUserDetails = async () => {
    setLoading(true);
    setPreview(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`);

      const { ProfilePic, ...baseUser } = res.data;

      // Fetch preferences and favorites
      const [cuisinesRes, restaurantsRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/users/${userId}/cuisine-preferences`
        ),
        axios.get(
          `http://localhost:5000/api/users/${userId}/restaurant-preferences`
        ),
      ]);

      const sanitizedData = {
        ...baseUser,
        preferences: Array.isArray(cuisinesRes.data) ? cuisinesRes.data : [],
        favorites: Array.isArray(restaurantsRes.data)
          ? restaurantsRes.data
          : [],
      };

      setUser(sanitizedData);
      setFormData(sanitizedData);
      setOriginalPreferences(sanitizedData.preferences);
      setOriginalFavorites(sanitizedData.favorites);

      // Fetch all cuisines and restaurants
      const [cuisinesFetch, restaurantsFetch] = await Promise.all([
        axios.get("http://localhost:5000/api/cuisines"),
        axios.get("http://localhost:5000/api/restaurants"),
      ]);
      setAllCuisines(cuisinesFetch.data.data);
      setAllRestaurants(restaurantsFetch.data.data);

      // Handle ProfilePic
      const buffer = ProfilePic;
      if (buffer?.data) {
        const byteArray = new Uint8Array(buffer.data);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.data?.message) {
        setErrors(err.response.data.message);
      } else {
        setErrors("Failed to get details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      const file = files[0];
      setFormData({ ...formData, profilePic: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setErrors({
      Name: "",
      Username: "",
      PhoneNum: "",
      Email: "",
      password: "",
    });

    const {
      Name,
      Username,
      Email,
      PhoneNum,
      profilePic,
      preferences,
      favorites,
    } = formData;

    // === FRONTEND VALIDATION ===
    const newErrors = {
      Name: Name.trim() === "" ? "Name is required." : "",
      Username: Username.trim() === "" ? "Username is required." : "",
      Email:
        Email.trim() === ""
          ? "Email is required."
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)
          ? "Invalid email format."
          : "",
      PhoneNum:
        PhoneNum.trim() === ""
          ? "Phone number is required."
          : !/^\d{10,15}$/.test(PhoneNum)
          ? "Phone number must be 10 to 15 digits."
          : "",
      password: "",
    };

    if (oldPassword || newPassword) {
      if (!oldPassword)
        newErrors.password = "Old and New password is required.";
      else if (newPassword.length < 6)
        newErrors.password = "New password must be at least 6 characters.";
    }

    const hasValidationErrors = Object.values(newErrors).some((e) => e);
    if (hasValidationErrors) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // === BACKEND CALLS ===
    try {
      // 1. Update user info
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("name", Name);
        formDataToSend.append("username", Username);
        formDataToSend.append("email", Email);
        formDataToSend.append("phoneNum", PhoneNum);

        if (profilePic instanceof File) {
          formDataToSend.append("profilePic", profilePic);
        }
        await axios.put(
          `http://localhost:5000/api/users/${userId}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (err) {
        const rawMessage =
          err.response?.data?.error || "Failed to update user info.";

        const fieldErrors = {};

        if (rawMessage.includes("Username")) {
          fieldErrors["Username"] = "Username already exists.";
        }
        if (rawMessage.includes("Email")) {
          fieldErrors["Email"] = "Email already exists.";
        }
        if (rawMessage.includes("Phone")) {
          fieldErrors["PhoneNum"] = "Phone number already exists.";
        }
        if (rawMessage.includes("User not found")) {
          fieldErrors["Name"] = "User not found.";
        }

        const hasFieldErrors = Object.keys(fieldErrors).length > 0;

        if (hasFieldErrors) {
          setErrors((prev) => ({
            ...prev,
            ...fieldErrors,
          }));
          // Don't throw a new error message that will override it
          throw null;
        } else {
          // No specific field errors, fall back to generic
          throw new Error("Failed to update user info.");
        }
      }

      // 2. Update password if applicable
      if (oldPassword && newPassword) {
        try {
          await axios.post("http://localhost:5000/api/users/change-password", {
            userId,
            oldPassword,
            newPassword,
          });
        } catch {
          setErrors((prev) => ({
            ...prev,
            password: "Old password doesn't match.",
          }));
          throw new Error("Password update failed.");
        }
      }

      // 3. Update cuisine preferences
      try {
        const oldCuisineIds = originalPreferences.map((c) => c.CuisineID);
        const newCuisineIds = Array.isArray(preferences)
          ? preferences.map((c) => (typeof c === "object" ? c.CuisineID : c))
          : [];

        const cuisinesToAdd = newCuisineIds.filter(
          (id) => !oldCuisineIds.includes(id)
        );
        const cuisinesToRemove = oldCuisineIds.filter(
          (id) => !newCuisineIds.includes(id)
        );

        await Promise.all([
          ...cuisinesToAdd.map((cuisineId) =>
            axios.post("http://localhost:5000/api/users-cuisine-preferences", {
              userId,
              cuisineId,
            })
          ),
          ...cuisinesToRemove.map((cuisineId) =>
            axios.delete(
              `http://localhost:5000/api/users/${userId}/cuisine-preferences`,
              { data: { cuisineId } }
            )
          ),
        ]);
      } catch {
        throw new Error("Failed to update cuisine preferences.");
      }

      // 4. Update favorite restaurants
      try {
        const oldRestaurantIds = originalFavorites.map((r) => r.RestaurantID);
        const newRestaurantIds = Array.isArray(favorites)
          ? favorites.map((r) => (typeof r === "object" ? r.RestaurantID : r))
          : [];

        const restaurantsToAdd = newRestaurantIds.filter(
          (id) => !oldRestaurantIds.includes(id)
        );
        const restaurantsToRemove = oldRestaurantIds.filter(
          (id) => !newRestaurantIds.includes(id)
        );

        await Promise.all([
          ...restaurantsToAdd.map((restaurantId) =>
            axios.post(
              "http://localhost:5000/api/users-restaurant-preferences",
              {
                userId,
                restaurantId,
              }
            )
          ),
          ...restaurantsToRemove.map((restaurantId) =>
            axios.delete(
              `http://localhost:5000/api/users/${userId}/restaurant-preferences`,
              { data: { restaurantId } }
            )
          ),
        ]);
      } catch {
        throw new Error("Failed to update restaurant preferences.");
      }

      // Final cleanup
      setEditMode(false);
      setOldPassword("");
      setNewPassword("");
      await fetchUserDetails();
    } catch (err) {
      console.error("Update Error:", err);
      if (!err) return; // Skip if already handled field-specific errors

      if (typeof err === "string" || err instanceof Error) {
        setErrors((prev) => ({
          ...prev,
          Name: err.message || "An unexpected error occurred.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);

      // Clear all user-related data
      localStorage.clear();

      // Navigate to homepage
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const addItemToList = (field, value) => {
    setFormData((prev) => {
      // Check for duplicate by Name
      const alreadyExists = prev[field].some(
        (item) => item.Name === value.Name
      );
      if (alreadyExists) return prev;

      return {
        ...prev,
        [field]: [...prev[field], value],
      };
    });

    if (field === "preferences") setNewCuisine("");
    if (field === "favorites") setNewFavorite("");
  };

  const removeItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (!user || loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ArrowPathIcon className="h-5 w-5 animate-spin text-theme-pink" />
      </div>
    );

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="text-4xl text-theme-pink p-7 font-bold border-b">
          Profile Information
        </div>
        <div className="w-full h-full mx-auto p-8 bg-white text-theme-brown space-y-10">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex justify-center items-center flex-col gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-56 h-56 rounded-full object-cover border border-theme-pink"
                />
              ) : (
                <img
                  src={imageUrl || defaultProfilePic}
                  alt="Profile"
                  className="w-56 h-56 rounded-full object-cover border border-theme-pink"
                />
              )}
              {editMode && (
                <label className="cursor-pointer bg-theme-pink text-white px-4 py-2 rounded hover:bg-pink-700 transition">
                  Change Photo
                  <input
                    name="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {["Name", "Username", "PhoneNum", "Email"].map((field) => (
                <div key={field}>
                  <label className="text-2xl text-theme-pink capitalize">
                    {field}
                  </label>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg mt-1">{user[field]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="text-2xl text-theme-pink capitalize">
                  {editMode ? "Old Password" : "Password "}
                </label>
                {editMode ? (
                  <>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm"
                      >
                        {showPasswords.current ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-lg mt-1">••••••••</p>
                )}
              </div>

              {editMode && (
                <div>
                  <label className="text-2xl text-theme-pink">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm"
                    >
                      {showPasswords.new ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="font-semibold text-2xl text-theme-pink">
                Preferred Cuisines
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferences.map((item, i) => (
                  <span
                    key={i}
                    className="bg-theme-pink px-5 py-1 rounded-full text-lg text-white flex items-center"
                  >
                    {item.Name}
                    {editMode && (
                      <button
                        onClick={() => removeItem("preferences", i)}
                        className="ml-2 text-white"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {editMode && (
                <div className="mt-3 flex gap-3">
                  <select
                    value={newCuisine?.Name || ""}
                    onChange={(e) => {
                      const selected = allCuisines.find(
                        (c) => c.Name === e.target.value
                      );
                      setNewCuisine(selected);
                    }}
                    className="border px-3 py-2 rounded flex-1"
                  >
                    <option value="">Select Cuisine</option>
                    {allCuisines.map((cuisine, i) => (
                      <option key={i} value={cuisine.Name}>
                        {cuisine.Name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => addItemToList("preferences", newCuisine)}
                    className="bg-theme-pink text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-2xl text-theme-pink">
                Favorite Restaurants
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.favorites.map((item, i) => (
                  <span
                    key={i}
                    className="bg-theme-pink px-5 py-1 rounded-full text-lg text-white flex items-center"
                  >
                    {item.Name}
                    {editMode && (
                      <button
                        onClick={() => removeItem("favorites", i)}
                        className="ml-2 text-white"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {editMode && (
                <div className="mt-3 flex gap-3">
                  <select
                    value={newFavorite?.Name || ""}
                    onChange={(e) => {
                      const selected = allRestaurants.find(
                        (r) => r.Name === e.target.value
                      );
                      setNewFavorite(selected);
                    }}
                    className="border px-3 py-2 rounded flex-1"
                  >
                    <option value="">Select Restaurant</option>
                    {allRestaurants.map((r, i) => (
                      <option key={i} value={r.Name}>
                        {r.Name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => addItemToList("favorites", newFavorite)}
                    className="bg-theme-pink text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {editMode ? (
              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-theme-pink text-white px-5 py-2 rounded hover:bg-pink-700 transition"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setOldPassword("");
                    setNewPassword("");
                  }}
                  className="text-theme-brown underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditMode(true);
                }}
                className="bg-theme-pink text-white px-5 py-2 rounded hover:bg-pink-700 transition"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          handleDeleteAccount();
          setModalOpen(false);
        }}
      />
    </>
  );
};

export default Profile;
