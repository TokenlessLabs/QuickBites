import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import defaultRestaurantPic from "../../assets/default-restaurant.png";

const AddReviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [ratings, setRatings] = useState({});
  const [imageURLs, setImageURLs] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem("userId");
        const [response, approvedResponse, reviewsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/restaurants"),
          axios
            .get("http://localhost:5000/api/reservations-user", {
              params: { status: "Approved,Completed" },
            })
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`http://localhost:5000/api/reviews-user/${userId}`)
            .catch(() => ({ data: { data: [] } })),
        ]);

        const approvedRestaurants = new Set(
          (approvedResponse.data.data || []).map(
            (reservation) => reservation.RestaurantName
          )
        );
        const reviewedRestaurants = new Set(
          (reviewsResponse.data.data || []).map((review) => review.Name)
        );
        const restaurantData = response.data.data.filter(
          (restaurant) =>
            approvedRestaurants.has(restaurant.Name) &&
            !reviewedRestaurants.has(restaurant.Name)
        );
        setRestaurants(restaurantData);

        // Initialize image and rating data
        const ratingsData = {};
        const imageURLMap = {};

        for (let restaurant of restaurantData) {
          // Fetch average rating
          const ratingResponse = await axios.get(
            `http://localhost:5000/api/stats/${restaurant.RestaurantID}`
          );
          ratingsData[restaurant.RestaurantID] =
            ratingResponse.data.data.averageRating;

          // Convert profilePic binary to Blob URL if exists
          if (restaurant.ProfilePic && restaurant.ProfilePic.data) {
            const byteArray = new Uint8Array(restaurant.ProfilePic.data);
            const blob = new Blob([byteArray], { type: "image/jpeg" });
            const imageURL = URL.createObjectURL(blob);
            imageURLMap[restaurant.RestaurantID] = imageURL;
          }
        }

        setRatings(ratingsData);
        setImageURLs(imageURLMap);
      } catch (error) {
        console.error("Error fetching restaurants or ratings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(imageURLs).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageURLs]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleRestaurantClick = (restaurantId) => {
    // Store the RestaurantID directly in localStorage
    localStorage.setItem("restaurantId", restaurantId);

    // Redirect to restaurant reviews page
    navigate("/customer/restaurants/reviews");
  };

  const RestaurantCard = ({ restaurant }) => {
    const averageRating = ratings[restaurant.RestaurantID];
    const imageUrl = imageURLs[restaurant.RestaurantID] || defaultRestaurantPic;
    return (
      <div
        onClick={() => handleRestaurantClick(restaurant.RestaurantID)}
        className="p-4 bg-white border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center cursor-pointer"
      >
        {/* Image */}
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mr-6 overflow-hidden">
          <img
            src={imageUrl}
            alt={restaurant.Name}
            className={`object-cover ${
              imageUrl === defaultRestaurantPic
                ? "w-[90%] h-[90%]"
                : "w-full h-full"
            }`}
          />
        </div>
        {/* Restaurant Information */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800">{restaurant.Name}</h3>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-md font-semibold text-gray-800">
              {averageRating ? averageRating.toFixed(1) : "0.0"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ArrowPathIcon className="h-5 w-5 animate-spin text-theme-pink" />
      </div>
    );

  return (
    <div className="h-screen">
      <div className="text-4xl text-theme-pink p-7 font-bold border-b">
        Add Reviews
      </div>
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        {/* Buttons */}
        <div className="w-full max-w-6xl flex justify-start space-x-4">
          <Link
            to="/customer/reviews"
            className="py-2 px-5 bg-theme-pink text-white text-base font-semibold rounded hover:bg-pink-600 transition duration-200"
          >
            Add Review
          </Link>
          <Link
            to="/customer/reviews/past"
            className="py-2 px-5 bg-gray-300 text-gray-800 text-base font-semibold rounded hover:bg-gray-400 transition duration-200"
          >
            Past Reviews
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-6xl mt-12 mb-8 relative">
          <div className="w-full flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4" />
            <input
              type="text"
              placeholder="Search restaurant to review"
              className="w-full p-4 pl-12 text-lg bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-theme-pink"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {restaurants.length === 0 && (
            <p className="text-gray-500 col-span-full">
              You can review restaurants with an approved reservation.
            </p>
          )}
          {restaurants
            .filter((restaurant) =>
              restaurant.Name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((restaurant) => (
              <RestaurantCard
                key={restaurant.RestaurantID}
                restaurant={restaurant}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AddReviews;
