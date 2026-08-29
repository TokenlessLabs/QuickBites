import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StarIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const StarRating = ({ rating }) => (
  <div className="flex justify-center items-center">
    {[...Array(5)].map((_, i) => {
      const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
      return (
        <div key={i} className="relative w-6 h-6">
          <StarIcon className="absolute text-gray-300" />
          <StarIcon
            className="absolute text-yellow-500"
            style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
          />
        </div>
      );
    })}
  </div>
);

const RestaurantReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("Descending");
  const [averageRating, setAverageRating] = useState(0);
  const [restName, setRestName] = useState("...");
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");

  const fetchAverageRating = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/stats/${restaurantId}`
      );
      if (res.data.success) {
        setAverageRating(res.data.data.averageRating || 0);
        setRestName(res.data.data.RestaurantName);
      }
    } catch (err) {
      console.error("Error fetching average rating:", err);
    }
  };

  const fetchUserName = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
      return res.data.Name;
    } catch {
      return "Anonymous";
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/sort/restaurant/${restaurantId}`,
        {
          params: { order: sortOrder },
        }
      );

      if (res.data.success) {
        const rawReviews = res.data.data;
        const enrichedReviews = await Promise.all(
          rawReviews.map(async (review) => {
            const userName = await fetchUserName(review.UserID);
            return { ...review, Name: userName };
          })
        );
        setReviews(enrichedReviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  const fetchRestaurantName = async (restaurantId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/restaurants/${restaurantId}`
      );
      setRestName(res.data.data.Name);
    } catch (err) {
      return err;
    }
  };

  useEffect(() => {
    fetchAverageRating();
    fetchRestaurantName(restaurantId);
    fetchReviews();
  }, [sortOrder]);

  return (
    <div className="min-h-screen w-full text-theme-brown relative p-6">
      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/admin/restaurants/details"
        >
          Details
        </Link>
        <Link
          className="bg-theme-pink text-white px-4 py-2 rounded shadow-md"
          to="/admin/restaurants/reviews"
        >
          Reviews
        </Link>
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
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

      <h1 className="text-3xl font-bold text-center text-theme-pink mb-6 mt-4">
        {loading ? "..." : restName}
      </h1>

      <div className="text-center mb-6">
        <StarRating rating={averageRating} />
        <p className="text-gray-500 text-sm mt-1">
          Rated {averageRating} out of 5
        </p>
      </div>

      {/* Reviews Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-theme-pink">
          What others are saying
        </h2>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border text-sm rounded px-2 py-1"
        >
          <option value="Descending">Sort by Highest Stars</option>
          <option value="Ascending">Sort by Lowest Stars</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <ArrowPathIcon className="h-5 w-5 animate-spin text-theme-pink" />
          </div>
        ) : reviews.length === 0 && hasFetched ? (
          <p className="text-center text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{review.Name}</span>
                <StarRating rating={review.Rating} />
              </div>
              <p className="text-sm text-gray-700 break-words">
                {review.Comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantReviews;
