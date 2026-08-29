import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import defaultRestaurantImage from "../../assets/default-restaurant.png";

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [restsPrefs, setRestsPrefs] = useState([]);
  const [cuisinePrefs, setCuisinePrefs] = useState([]);
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  const [loading, setLoading] = useState(true); // Manage loading state
  const [error, setError] = useState(""); // Manage error state
  const userId = localStorage.getItem("userId");
  const imageUrlCache = useRef({});
  const createdUrls = useRef(new Set());

  const getImageUrlFromBytes = (buffer, id) => {
    if (!buffer?.data) return defaultRestaurantImage;

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

  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        setLoading(true);
        setError("");

        try {
          const [restaurantsRes, cuisinePrefsRes, restsPrefsRes] =
            await Promise.all([
              axios.get("http://localhost:5000/api/restaurants-search", {
                params: { userId, location, sortBy },
              }),
              axios.get("http://localhost:5000/api/restaurants-search", {
                params: {
                  userId,
                  filterBy: "PreferredCuisines",
                  location,
                  sortBy,
                },
              }),
              axios.get("http://localhost:5000/api/restaurants-search", {
                params: {
                  userId,
                  filterBy: "PreferredRestaurants",
                  location,
                  sortBy,
                },
              }),
            ]);

          const toProcessed = (data) =>
            data.map((restaurant) => ({
              ...restaurant,
              imageUrl: getImageUrlFromBytes(
                restaurant.ProfilePic,
                restaurant.RestaurantID
              ),
            }));

          setRestaurants(toProcessed(restaurantsRes.data.data));
          setCuisinePrefs(toProcessed(cuisinePrefsRes.data.data));
          setRestsPrefs(toProcessed(restsPrefsRes.data.data));
        } catch {
          setError("An error occurred while fetching data.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userId, location, sortBy]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filteredRestaurants = restaurants.filter((r) =>
    r.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const RestaurantCard = ({ restaurant }) => {
    const handleCardClick = () => {
      localStorage.setItem("restaurantId", restaurant.RestaurantID);
    };

    const imageUrl = restaurant.imageUrl || defaultRestaurantImage;

    return (
      <Link
        to="/customer/restaurants/details"
        onClick={handleCardClick}
        className="p-4 bg-white border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center"
      >
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mr-6 overflow-hidden">
          <img
            src={imageUrl}
            alt={restaurant.Name}
            className={`object-cover ${
              imageUrl === defaultRestaurantImage
                ? "w-[90%] h-[90%]"
                : "w-full h-full"
            }`}
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800">{restaurant.Name}</h3>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-md font-semibold text-gray-800">
              {restaurant.AverageRating.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ArrowPathIcon className="h-5 w-5 animate-spin text-theme-pink" />
      </div>
    );

  return (
    <div className="h-screen flex flex-col">
      {/* Heading */}
      <div className="text-4xl text-theme-pink p-7 font-bold border-b">
        Restaurants
      </div>

      {/* Content */}
      <div className="w-full h-full mx-auto p-8 bg-white text-theme-brown space-y-10 overflow-y-auto">
        {/* Search Bar */}
        <div className="w-full max-w-6xl relative mx-auto">
          <div className="w-full relative flex items-center border border-gray-300 rounded-full">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4" />
            <input
              type="text"
              placeholder="Search restaurant to reserve"
              className="w-full p-4 pl-12 text-lg bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-pink"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/*Error States */}
        {error && <div className="text-red-500">{error}</div>}

        {/* Main Sections */}
        {searchQuery ? (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-theme-pink mb-4">
              Search Results
            </h2>
            <div className="border-b-2 border-pink-500 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredRestaurants.length === 0 && (
                <div className="text-gray-500 ml-2 mt-4">
                  No restaurants found.
                </div>
              )}
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard key={index} restaurant={restaurant} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {restsPrefs.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-theme-pink mb-4">
                  Your Faves
                </h2>
                <div className="border-b-2 border-pink-500 mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {restsPrefs.map((restaurant, index) => (
                    <RestaurantCard key={index} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}

            {cuisinePrefs.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-theme-pink mb-4">
                  Restaurants That Offer Your Cuisines
                </h2>
                <div className="border-b-2 border-pink-500 mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {cuisinePrefs.map((restaurant, index) => (
                    <RestaurantCard key={index} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-pink-500">
                  All Restaurants
                </h2>
                <div className="flex space-x-4">
                  <div className="w-full flex flex-col gap-1">
                    <div className="text-sm text-gray-500">Sort By</div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-pink focus:border-theme-pink"
                      onChange={(e) => setSortBy(e.target.value)} // Update the sortBy state
                    >
                      <option value="Name">Name</option>
                      <option value="Rating">Rating</option>
                    </select>
                  </div>
                  <div className="w-full flex flex-col gap-1">
                    <div className="text-sm text-gray-500">Location</div>
                    <select
                      value={location} // ✅ This is what was missing
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-pink focus:border-theme-pink"
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-b-2 border-pink-500 mb-8"></div>
              {restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {restaurants.map((restaurant, index) => (
                    <RestaurantCard key={index} restaurant={restaurant} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-lg mt-10">
                  No restaurants available.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
