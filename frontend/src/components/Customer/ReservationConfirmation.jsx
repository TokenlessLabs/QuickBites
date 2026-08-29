import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const ReservationConfirmation = () => {
  const location = useLocation();
  const { dateTime, duration, specialRequest } = location.state || {};

  const restaurantId = localStorage.getItem("restaurantId");
  const [restaurantName, setRestaurantName] = useState("");
  const [tables, setTables] = useState([]);
  const [capacity, setCapacity] = useState("");

  // Fetch restaurant name
  useEffect(() => {
    const fetchRestaurantName = async () => {
      if (!restaurantId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/restaurants/${restaurantId}`
        );
        setRestaurantName(res.data.data.Name);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      }
    };
    fetchRestaurantName();
  }, [restaurantId]);

  // Fetch filtered tables
  const fetchTables = async (capacityValue) => {
    if (!restaurantId || !dateTime || !duration || Number(capacityValue) <= 0) {
      setTables([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/restaurants/${restaurantId}/tables-by-capacity-time`,
        {
          params: {
            minCapacity:
              capacityValue && !isNaN(capacityValue)
                ? parseInt(capacityValue)
                : 0,
            startTime: new Date(dateTime).toISOString(),
            durationMinutes: duration * 60,
          },
        }
      );
      setTables(res.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  // Fetch tables on mount or capacity change
  useEffect(() => {
    if (restaurantId && dateTime && duration) {
      fetchTables(capacity);
    }
  }, [restaurantId, capacity]);

  if (!dateTime || !duration) {
    return <Navigate to="/customer/restaurants/reserve" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Navigation */}
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
        Reservations at {restaurantName || "..."}
      </h1>

      {/* Filter by capacity */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <div>
          <label className="block text-center text-sm font-semibold text-gray-700 mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            min="0"
            className="border rounded px-3 py-2 w-40"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Enter party size"
          />
        </div>
      </div>

      {/* Table List */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table, key) => (
            <div
              key={table.TableID}
              className="p-4 rounded shadow-md border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Table {key + 1}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Capacity:</strong> {table.Capacity} seats
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Description:</strong> {table.Description}
              </p>
              <div className="w-full text-white rounded flex justify-center items-center bg-theme-pink hover:bg-pink-600">
                <Link
                  to="/customer/restaurants/reservations/payment"
                  state={{
                    tableId: table.TableID,
                    restaurantName,
                    dateTime,
                    duration,
                    specialRequest,
                    capacity: table.Capacity,
                    people: Number(capacity),
                    description: table.Description,
                  }}
                  className="w-full text-white rounded flex justify-center items-center bg-theme-pink hover:bg-pink-600 py-2"
                >
                  Reserve
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-10">
          No tables available.
        </p>
      )}
    </div>
  );
};

export default ReservationConfirmation;
