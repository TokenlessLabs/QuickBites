import React, { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LocationMarker = ({ position, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const NewRestaurant = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    startTime: "",
    endTime: "",
  });

  const [location, setLocation] = useState({ lat: 31.5497, lng: 74.3436 }); // Lahore default
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [restaurantImages, setRestaurantImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ capacity: "", description: "" });
  const [cuisines, setCuisines] = useState([]);
  const userId = localStorage.getItem("userId");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);

  const mapRef = useRef(null);
  const imageInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cuisines");
        setCuisines(res.data.data);
      } catch (err) {
        console.error("Error fetching cuisines:", err);
      }
    };

    fetchCuisines();
  }, []);

  const updateAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setAddress(data.display_name || "");
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      const data = await res.json();
      if (data?.[0]) {
        const { lat, lon, display_name } = data[0];
        const newLoc = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setLocation(newLoc);
        setAddress(display_name);
        mapRef.current?.setView(newLoc, 15);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleMapClick = useCallback((latlng) => {
    setLocation(latlng);
    updateAddress(latlng.lat, latlng.lng);
  }, []);

  const handleInput = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCuisineChange = (e, cuisine) => {
    const isChecked = e.target.checked;
    setSelectedCuisines((prev) =>
      isChecked
        ? [...prev, cuisine]
        : prev.filter((c) => c.CuisineID !== cuisine.CuisineID)
    );
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    const newImagePreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setRestaurantImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const newFiles = [...restaurantImages];
    const newPreviews = [...imagePreviews];

    URL.revokeObjectURL(newPreviews[index].url);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setRestaurantImages(newFiles);
    setImagePreviews(newPreviews);
  };

  const addTable = () => {
    const cap = parseInt(newTable.capacity);
    if (!cap || cap <= 0) return alert("Capacity must be a positive number.");
    setTables((prev) => [...prev, { ...newTable, capacity: cap }]);
    setNewTable({ capacity: "", description: "" });
  };

  const removeTable = (index) => {
    setTables((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (restaurantID) => {
    for (const image of restaurantImages) {
      const imgForm = new FormData();
      imgForm.append("image", image);
      imgForm.append("UserID", userId);

      try {
        await axios.post(
          `http://localhost:5000/api/restaurants/${restaurantID}/add-image`,
          imgForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } catch (err) {
        console.error("Image upload error:", err);
      }
    }
  };

  const addCuisines = async (restaurantID) => {
    for (const Cuisine of selectedCuisines) {
      try {
        await axios.post("http://localhost:5000/api/restaurants-cuisines", {
          RestaurantID: restaurantID,
          CuisineID: Cuisine.CuisineID,
        });
      } catch (err) {
        console.error("Error adding cuisine:", err);
      }
    }
  };

  const addTables = async (restaurantID) => {
    for (const table of tables) {
      try {
        await axios.post("http://localhost:5000/api/tables", {
          userId,
          capacity: table.capacity,
          description: table.description,
          restaurantId: restaurantID,
        });
      } catch (err) {
        console.error("Error adding table:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Restaurant name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!address.trim()) newErrors.address = "Location is required.";
    if (!formData.startTime) newErrors.startTime = "Start time is required.";
    if (!formData.endTime) newErrors.endTime = "End time is required.";
    if (!profilePic) newErrors.profilePic = "Profile picture is required.";
    if (!tables || tables.length === 0)
      newErrors.tables = "At least one table must be added.";

    if (
      formData.phone &&
      (formData.phone.length < 10 || formData.phone.length > 13)
    ) {
      newErrors.phone = "Phone number must be between 10 and 13 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const form = new FormData();
      form.append("UserID", userId);
      form.append("Name", formData.name);
      form.append("Description", formData.description);
      form.append("ProfilePic", profilePic);
      form.append("PhoneNum", formData.phone);
      form.append(
        "OperatingHoursStart",
        new Date(`1970-01-01T${formData.startTime}`)
      );
      form.append(
        "OperatingHoursEnd",
        new Date(`1970-01-01T${formData.endTime}`)
      );
      form.append("Location", address);

      const res = await axios.post(
        "http://localhost:5000/api/restaurants",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { RestaurantID } = res.data;
      setRestaurantId(RestaurantID);

      await uploadImages(RestaurantID);
      await addCuisines(RestaurantID);
      await addTables(RestaurantID);

      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Submit error:", err);
      const responseData = err.response?.data;
      const validationDetails = responseData?.errors
        ?.map((validationError) => validationError.msg)
        .join(" ");

      setSubmitError(
        validationDetails ||
          responseData?.error ||
          responseData?.message ||
          "Could not reach the server. Please make sure the backend is running."
      );
    }
  };

  return (
    <>
      <div className="h-screen">
        <div className="text-4xl text-theme-pink p-7 font-bold border-b">
          Add a Restaurant
        </div>
        <div className="p-6 max-w-7xl mx-auto bg-white text-theme-brown">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-medium">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInput}
                  className="mt-2 w-full border rounded-md p-3 shadow"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInput}
                  className="mt-2 w-full border rounded-md p-3 shadow"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="font-medium">Opening Time</label>
                <input
                  type="time"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleInput}
                  className="mt-2 w-full border rounded-md p-3 shadow"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label className="font-medium">Closing Time</label>
                <input
                  type="time"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleInput}
                  className="mt-2 w-full border rounded-md p-3 shadow"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-medium">Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInput}
                className="mt-2 w-full border rounded-md p-3 shadow resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            {/* Cuisine Selection */}
            <div>
              <label className="font-medium block mb-2">Cuisines Offered</label>
              <div className="flex flex-wrap gap-3">
                {cuisines.map((cuisine) => {
                  const isSelected = selectedCuisines.some(
                    (c) => c.CuisineID === cuisine.CuisineID
                  );
                  return (
                    <label
                      key={cuisine.CuisineID}
                      className={`flex items-center gap-2 cursor-pointer ${
                        isSelected ? "text-pink-500" : "text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCuisineChange(e, cuisine)}
                        className="accent-pink-500"
                      />
                      {cuisine.Name}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Table Section */}
            <div>
              <label className="font-medium block mb-2">Add Tables</label>
              <div className="flex gap-4 mb-2">
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newTable.capacity}
                  onChange={(e) =>
                    setNewTable((p) => ({ ...p, capacity: e.target.value }))
                  }
                  className="border rounded-md p-2 w-28"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newTable.description}
                  onChange={(e) =>
                    setNewTable((p) => ({ ...p, description: e.target.value }))
                  }
                  className="border rounded-md p-2 flex-1"
                />
                <button
                  type="button"
                  onClick={addTable}
                  className="bg-theme-pink hover:bg-pink-600 text-white px-4 rounded-md shadow"
                >
                  Add
                </button>
              </div>

              {tables.length > 0 && (
                <ul className="space-y-2">
                  {tables.map((table, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded shadow"
                    >
                      <span>
                        Capacity: {table.capacity} | {table.description}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTable(idx)}
                        className="text-red-600"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.tables && (
                <p className="text-red-500 text-sm">{errors.tables}</p>
              )}
            </div>

            {/* Map + Search */}
            <div>
              <label className="font-medium">Find Restaurant Location</label>
              <div className="flex gap-3 my-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search area e.g. Gulberg"
                  className="w-full border rounded-md p-2 shadow"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-theme-pink text-white px-4 py-2 rounded-md shadow hover:bg-pink-600"
                >
                  Search
                </button>
              </div>

              <div className="h-64 rounded-md overflow-hidden border shadow">
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={13}
                  scrollWheelZoom
                  className="h-full w-full"
                  whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationMarker
                    position={location}
                    onMapClick={handleMapClick}
                  />
                </MapContainer>
              </div>

              {address && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Selected Address:</strong> {address}
                </p>
              )}
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>

            {/* Profile Pic */}
            <div>
              <label className="font-medium block mb-2">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-theme-pink hover:bg-pink-600 text-white px-4 py-2 rounded-md shadow">
                  Choose Profile
                  <input
                    type="file"
                    name="profilePic"
                    accept="image/*"
                    onChange={handleProfileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.profilePic && (
                <p className="text-red-500 text-sm">{errors.profilePic}</p>
              )}
            </div>

            {/* Gallery Uploads */}
            <div>
              <label className="font-medium block mb-3">
                Restaurant Gallery
              </label>
              <label className="cursor-pointer inline-block bg-theme-pink hover:bg-pink-600 text-white px-4 py-2 rounded-md shadow mb-4">
                Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  ref={imageInputRef}
                  className="hidden"
                />
              </label>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((imgObj, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 border rounded-md overflow-hidden shadow"
                  >
                    <img
                      src={imgObj.url}
                      alt={`img-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-bl px-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-theme-pink hover:bg-pink-600 text-white py-3 px-6 rounded-md shadow"
            >
              Register Restaurant
            </button>
          </form>
          {submitError && (
            <div className="text-red-500 mb-4">{submitError}</div>
          )}
        </div>
      </div>
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md">
            <h2 className="text-xl font-bold mb-4 text-green-600">
              Restaurant Registered!
            </h2>
            <p className="mb-4">
              Your restaurant has been successfully registered.
            </p>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                localStorage.setItem("restaurantId", restaurantId);
                navigate("/admin/restaurants/details");
              }}
              className="px-4 py-2 bg-theme-pink text-white rounded-lg hover:bg-pink-600"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NewRestaurant;
