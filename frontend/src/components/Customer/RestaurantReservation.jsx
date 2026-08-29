import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const RestaurantReservation = () => {
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem("restaurantId");

  const [restaurantName, setRestaurantName] = useState("Loading...");
  const [openingHour, setOpeningHour] = useState(0);
  const [closingHour, setClosingHour] = useState(24);

  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [duration, setDuration] = useState(0.5); // default to 30 minutes
  const [specialRequest, setSpecialRequest] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    noDate: false,
    pastDate: false,
    futureDate: false,
    outsideHours: false,
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/restaurants/${restaurantId}`
        );
        const { Name, OperatingHoursStart, OperatingHoursEnd } =
          response.data.data;

        setRestaurantName(Name || "Restaurant");

        const startHour = new Date(OperatingHoursStart).getUTCHours();
        const endHour = new Date(OperatingHoursEnd).getUTCHours();

        setOpeningHour(startHour);
        setClosingHour(endHour);
      } catch (error) {
        console.error("Failed to fetch restaurant info", error);
        setRestaurantName("Unknown Restaurant");
      }
    };

    if (restaurantId) fetchRestaurant();
  }, [restaurantId]);

  const handleNext = () => {
    const errors = {
      noDate: false,
      pastDate: false,
      futureDate: false,
      outsideHours: false,
    };

    if (!selectedDateTime) {
      errors.noDate = true;
    } else {
      const now = new Date();
      const tenDaysLater = new Date();
      tenDaysLater.setDate(now.getDate() + 10);

      const selectedHour = selectedDateTime.getHours();
      let normalizedStart = selectedHour;
      let normalizedClosing = closingHour;

      if (closingHour <= openingHour) {
        normalizedClosing += 24;
        if (normalizedStart < openingHour) normalizedStart += 24;
      }

      if (selectedDateTime <= now) errors.pastDate = true;
      if (selectedDateTime > tenDaysLater) errors.futureDate = true;

      const isWithinOperatingHours =
        normalizedStart >= openingHour &&
        normalizedStart + duration <= normalizedClosing;

      if (!isWithinOperatingHours) errors.outsideHours = true;
    }

    const hasErrors = Object.values(errors).some(Boolean);
    setValidationErrors(errors);

    if (hasErrors) return;

    // Proceed to confirmation
    navigate("/customer/restaurants/reservations/confirmation", {
      state: {
        dateTime: selectedDateTime,
        duration: duration,
        specialRequest: specialRequest,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Navigation Buttons */}
      <div className="fixed top-6 left--1 flex gap-4 z-10">
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/customer/restaurants/details"
        >
          Details
        </Link>
        <Link
          className="bg-theme-pink text-white px-4 py-2 rounded shadow-md"
          to="/customer/restaurants/reserve"
        >
          Reserve
        </Link>
        <Link
          className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
          to="/customer/restaurants/reviews"
        >
          Reviews
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-theme-pink text-center mb-8 pt-20">
        Reservations at {restaurantName}
      </h1>

      <div className="h-full flex flex-col items-center justify-center p-4">
        {/* Date & Time Picker */}
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Choose Date & Time
          </h2>
          <DatePicker
            selected={selectedDateTime}
            onChange={(date) => setSelectedDateTime(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select date and time"
            className="w-full min-w-[450px] p-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-pink"
          />
        </div>
        {Object.values(validationErrors).some(Boolean) && (
          <div className="text-left text-red-600 mt-2 text-sm space-y-1 w-full max-w-md">
            {validationErrors.noDate && (
              <div>Please select a date and time.</div>
            )}
            {validationErrors.pastDate && (
              <div>The selected time must be in the future.</div>
            )}
            {validationErrors.futureDate && (
              <div>The reservation must be within the next 10 days.</div>
            )}
            {validationErrors.outsideHours && (
              <div>
                Please select a time between {openingHour}:00 and {closingHour}
                :00.
              </div>
            )}
          </div>
        )}

        {/* Duration Selector */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Duration</h2>
          <select
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-pink"
          >
            {Array.from({ length: 8 }, (_, i) => 0.5 + i * 0.5).map((val) => (
              <option key={val} value={val}>
                {val === 0.5
                  ? "30 minutes"
                  : `${val} ${val === 1 ? "hour" : "hours"}`}
              </option>
            ))}
          </select>
        </div>

        {/* Special Request */}
        <div className="w-full max-w-md mt-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Special Requests
          </h2>
          <textarea
            className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-pink resize-none"
            rows={4}
            placeholder="Enter any special requests..."
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full max-w-xs py-2 bg-theme-pink text-white flex items-center justify-center font-semibold rounded hover:bg-pink-600 transition duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RestaurantReservation;
