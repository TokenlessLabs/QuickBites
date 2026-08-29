import React, { useState } from "react";
import axios from "axios"; // Import axios for making API calls
import background from "../assets/signup-bg.jpg";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom"; // Use for navigation after successful signup

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "Customer",
    profilePic: null,
  });
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({}); // To handle individual field errors
  const [loading, setLoading] = useState(false); // To handle loading state
  const [modalVisible, setModalVisible] = useState(false); // State for controlling modal visibility
  const navigate = useNavigate(); // For redirecting to other pages

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

  // Validate the form data before submitting
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email address.";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!formData.phone.trim() || !/^\d{10,15}$/.test(formData.phone))
      newErrors.phone = "Enter a valid phone number.";
    if (!formData.role) newErrors.role = "Role selection is required.";

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors before validation
    setLoading(true); // Set loading state while the API request is in progress

    const validationErrors = validateForm();
    if (validationErrors) {
      setErrors(validationErrors); // Set validation errors if there are any
      setLoading(false);
      return;
    }

    const userPayload = new FormData();
    userPayload.append("name", formData.name);
    userPayload.append("username", formData.username);
    userPayload.append("email", formData.email);
    userPayload.append("password", formData.password);
    userPayload.append("phoneNum", formData.phone);
    userPayload.append("role", formData.role);
    if (formData.profilePic)
      userPayload.append("profilePic", formData.profilePic);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users",
        userPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("User created successfully:", response.data);

      // Fetch user details after creation (using the user ID from the response)
      const userId = response.data.userId;

      // Store the user ID in local storage
      localStorage.setItem("userId", userId);
      localStorage.removeItem("restaurantId");

      setModalVisible(true); // Show the modal on successful signup
    } catch (err) {
      setLoading(false); // Reset loading state after API call

      // Handle errors from API response
      if (err.response) {
        const message = err.response.data.error;

        // Specific error handling based on the stored procedure error messages
        if (message.includes("role")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            role: "Invalid role specified. Valid roles are: Customer, Admin, Staff.",
          }));
        }
        if (message.includes("username")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            username: "Username is already taken.",
          }));
        }
        if (message.includes("email")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: "Email is already registered.",
          }));
        }
        if (message.includes("phoneNum")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phone: "Phone number is already in use.",
          }));
        }
      } else {
        // In case of network error or other unexpected errors
        setErrors({
          api: err.message || "Signup failed. Please try again later.",
        });
      }
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (formData.role === "Staff") {
      navigate("/staff/reservations");
    } else {
      navigate("/customer/restaurants");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="text-4xl text-theme-pink p-6 font-bold border-b-2">
        Signup
      </div>
      <div
        className="h-full w-full text-theme-brown text-shadow-2xs"
        style={{ backgroundImage: `url(${background})` }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-8 w-full justify-center items-center"
        >
          <div className="flex flex-row w-full gap-4 px-2">
            <div className="flex flex-col gap-4 py-5 px-6 w-1/2">
              {/* Form fields */}
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-theme-pink"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="username" className="text-sm font-semibold">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-theme-pink"
                  required
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-theme-pink"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm font-semibold">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-theme-pink"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                <label className="text-xs mt-1 flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="accent-theme-pink"
                  />
                  Show Password
                </label>
              </div>
              <div className="flex flex-col">
                <label htmlFor="phone" className="text-sm font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-theme-pink"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="role" className="text-sm font-semibold">
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-theme-pink"
                  required
                >
                  <option value="Customer">Customer</option>
                  <option value="Staff">Staff</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center gap-2 w-1/2">
              <label className="relative w-80 h-80 rounded-full overflow-hidden border-3 border-theme-pink shadow-md cursor-pointer group">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:text-theme-pink">
                    <UserCircleIcon className="h-24 w-24" />
                  </div>
                )}
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <span className="text-lg font-semibold text-shadow-2xs">
                Upload Profile Picture
              </span>
            </div>
          </div>
          {errors.api && (
            <p className="text-red-500 text-center mt-4">{errors.api}</p>
          )}{" "}
          {/* API error message */}
          <button
            type="submit"
            className="bg-theme-pink text-white text-lg px-4 py-2 mt-6 rounded-md w-1/2"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center">
          <div className="bg-white p-8 rounded-md text-center">
            <h2 className="text-xl font-semibold">
              Account Created Successfully!
            </h2>
            <button
              onClick={handleModalClose}
              className="mt-4 bg-theme-pink text-white px-4 py-2 rounded"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
