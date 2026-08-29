import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ReservationPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    tableId,
    restaurantName,
    dateTime,
    duration,
    specialRequest,
    capacity,
    people,
    description,
  } = location.state || {};

  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const isoDateTime1 = new Date(dateTime).toISOString();
      const res = await axios.post("http://localhost:5000/api/reservations/checkout", {
        tableId,
        time: isoDateTime1,
        duration: duration * 60,
        people,
        request: specialRequest,
      });

      setModal({ open: true, success: true, message: res.data.message });
    } catch (error) {
      setModal({
        open: true,
        success: false,
        message: error.response?.data?.message || "Failed to add reservation",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, open: false });
    if (modal.success) {
      navigate("/customer/reservations");
    }
  };

  if (!tableId || !dateTime || !duration || !people) {
    return <Navigate to="/customer/restaurants/reserve" replace />;
  }

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

      <div className="h-full bg-gray-50 flex flex-col items-center justify-center">
        {/* Reservation Summary */}
        <div className="w-full max-w-md bg-white p-6 rounded shadow-md space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Reservation Summary
          </h2>

          {/* Details */}
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Date:</strong>{" "}
              {new Date(dateTime).toLocaleDateString("en-GB")}
            </p>
            <p className="text-gray-700">
              <strong>Time:</strong>{" "}
              {new Date(dateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-gray-700">
              <strong>Duration:</strong> {duration * 60} minutes
            </p>
            <p className="text-gray-700">
              <strong>Table Capacity:</strong> {capacity} seats
            </p>
            <p className="text-gray-700">
              <strong>Guests:</strong> {people}
            </p>
            <p className="text-gray-700">
              <strong>Table Description:</strong> {description}
            </p>
          </div>

          {/* Special Request */}
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Special Requests:</strong>
            </p>
            <div className="max-h-24 overflow-y-auto p-2 bg-gray-100 rounded text-gray-700 whitespace-pre-wrap">
              {specialRequest || "None"}
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Reservation Payment:</strong> Rs. 100
            </p>
          </div>

          {/* Confirm Button */}
          <div className="mt-8">
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full py-3 flex items-center justify-center bg-theme-pink text-white font-semibold rounded hover:bg-pink-600 transition duration-200 disabled:opacity-50"
            >
              {submitting ? "Confirming..." : "Confirm Reservation"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              {modal.success ? "Reservation Successful!" : "Reservation Failed"}
            </h3>
            <p className="text-gray-700 mb-4">{modal.message}</p>
            <button
              onClick={handleModalClose}
              className="bg-theme-pink text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPayment;
