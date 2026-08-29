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
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Alphabetical");
  const imageUrlCache = useRef({});
  const createdUrls = useRef(new Set());

  const userId = localStorage.getItem("userId");

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
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/users/${userId}/restaurants`
        );

        const toProcessed = (data) =>
          data.map((restaurant) => ({
            ...restaurant,
            imageUrl: getImageUrlFromBytes(
              restaurant.ProfilePic,
              restaurant.RestaurantID
            ),
          }));
        const restaurantList = response.data;
        setRestaurants(toProcessed(restaurantList));

        // Fetch average ratings
        const ratingsData = {};
        await Promise.all(
          restaurantList.map(async (r) => {
            try {
              const res = await axios.get(
                `http://localhost:5000/api/stats/${r.RestaurantID}`
              );
              ratingsData[r.RestaurantID] = res.data.data.averageRating || "0";
            } catch {
              ratingsData[r.RestaurantID] = "0";
            }
          })
        );
        setRatings(ratingsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filteredRestaurants = restaurants.filter((r) =>
    r.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSortedRestaurants = () => {
    const list = searchQuery ? filteredRestaurants : restaurants;
    return [...list].sort((a, b) => {
      if (sortOption === "Alphabetical") {
        return a.Name.localeCompare(b.Name);
      }
      if (sortOption === "Highest Rated") {
        const ratingA = parseFloat(ratings[a.RestaurantID]) || 0;
        const ratingB = parseFloat(ratings[b.RestaurantID]) || 0;
        return ratingB - ratingA;
      }
      return 0;
    });
  };

  const RestaurantCard = ({ restaurant }) => {
    const handleCardClick = () => {
      localStorage.setItem("restaurantId", restaurant.RestaurantID);
    };

    const imageUrl = restaurant.imageUrl || defaultRestaurantImage;

    return (
      <Link
        to="/admin/restaurants/details"
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
              {parseFloat(ratings[restaurant.RestaurantID]).toFixed(1)}
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
        Your Restaurants
      </div>

      {/* Content */}
      <div className="w-full h-full mx-auto p-8 bg-white text-theme-brown space-y-10 overflow-y-auto">
        {/* Search Bar */}
        <div className="w-full max-w-6xl relative mx-auto">
          <div className="w-full relative flex items-center border border-gray-300 rounded-full">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4" />
            <input
              type="text"
              placeholder="Search your restaurants"
              className="w-full p-4 pl-12 text-lg bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-pink"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Main Sections */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-pink-500">
              {searchQuery ? "Search Results" : "All Restaurants"}
            </h2>
            <div className="flex space-x-4">
              <div className="w-full flex flex-col gap-1">
                <div className="text-sm text-gray-500">Sort By</div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-pink focus:border-theme-pink"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="Alphabetical">Alphabetical</option>
                  <option value="Highest Rated">Highest Rated</option>
                </select>
              </div>
              <div className="w-full flex flex-col gap-1"></div>
            </div>
          </div>

          <div className="border-b-2 border-pink-500 mb-8"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {getSortedRestaurants().map((restaurant, index) => (
              <RestaurantCard key={index} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurants;
