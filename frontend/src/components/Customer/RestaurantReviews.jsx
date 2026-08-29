import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StarIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const StarRating = ({ rating }) => {
  return (
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
};

const RestaurantReviews = () => {
  const [selectedStars, setSelectedStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("Descending");
  const [averageRating, setAverageRating] = useState(0);
  const restaurantId = localStorage.getItem("restaurantId");
  const userId = localStorage.getItem("userId");
  const [restName, setRestName] = useState("...");
  const [loading, setLoading] = useState(true);

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

  const fetchReviews = async () => {
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
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchAverageRating(),
        fetchRestaurantName(restaurantId),
        fetchReviews(),
      ]);
      setLoading(false);
    };

    loadAll();
  }, [sortOrder]);

  const handleStarClick = (index) => {
    setSelectedStars(index + 1);
  };

  const handleSubmit = async () => {
    if (reviewText && selectedStars > 0) {
      try {
        const res = await axios.post("http://localhost:5000/api/review", {
          userId,
          restaurantId,
          rating: selectedStars,
          comment: reviewText,
        });

        if (res.data.success) {
          setReviewText("");
          setSelectedStars(0);
          fetchReviews();
          fetchAverageRating();
        }
      } catch (err) {
        console.error("Failed to submit review:", err);
      }
    }
  };

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ArrowPathIcon className="h-5 w-5 animate-spin text-theme-pink" />
      </div>
    );

  return (
    <div className="min-h-screen w-full text-theme-brown relative p-6">
      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/customer/restaurants/details"
        >
          Details
        </Link>
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/customer/restaurants/reserve"
        >
          Reserve
        </Link>
        <Link
          className="bg-theme-pink text-white px-4 py-2 rounded shadow-md"
          to="/customer/restaurants/reviews"
        >
          Reviews
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center text-theme-pink mb-6">
        {restName}
      </h1>

      <div className="text-center mb-6">
        <StarRating rating={averageRating} />
        <p className="text-gray-500 text-sm mt-1">
          Rated {averageRating.toFixed(1)} out of 5
        </p>
      </div>

      {/* Leave a Review Section */}
      <div className="bg-white p-4 rounded shadow relative mb-10">
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 cursor-pointer mx-1 ${
                i < selectedStars ? "text-yellow-500" : "text-gray-300"
              }`}
              onClick={() => handleStarClick(i)}
            />
          ))}
        </div>
        <textarea
          className="w-full border rounded p-2 text-sm resize-none max-h-32 overflow-auto"
          rows="3"
          placeholder="Leave a review!"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div className="flex justify-center mt-4">
          <button
            className="bg-theme-pink text-white px-4 py-2 rounded hover:bg-pink-600"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-theme-pink">
          What others are saying
        </h2>
        <div className="flex flex-col px-2 gap-1">
          <div className="text-sm text-gray-500">Sort By</div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border text-sm rounded px-2 py-1"
          >
            <option value="Descending">Highest Stars</option>
            <option value="Ascending">Lowest Stars</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center text-gray-500 italic">
            No reviews yet. Be the first to write one!
          </div>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">
                  {review.Name || "Anonymous"}
                </span>
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
