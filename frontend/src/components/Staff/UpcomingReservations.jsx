import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const UpcomingReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

 const fetchReservations = async () => {
  if (!userId) {
    setError("Please log in to view reservations.");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    const restaurantResponse = await axios.get(
      `http://localhost:5000/api/users/${userId}/get-Res`
    );
    const assignedRestaurants = restaurantResponse.data || [];

    if (assignedRestaurants.length === 0) {
      setReservations([]);
      setError("You have not been assigned to a restaurant yet.");
      return;
    }

    const reservationResponses = await Promise.all(
      assignedRestaurants.map(async (restaurant) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/reservations-rest-today?restaurantId=${restaurant.RestaurantID}`
          );
          return response.data.data || [];
        } catch (err) {
          if (err.response?.status === 404) return [];
          throw err;
        }
      })
    );

    setReservations(reservationResponses.flat());
    setError(null);
  } catch (err) {
    console.error(err);
    setReservations([]);
    setError("Failed to fetch today's reservations.");
  } finally {
    setLoading(false);
  }
};


  const markAsCompleted = async (reservationId) => {
    try {
      if (!userId) {
        alert("User ID not found.");
        return;
      }

      const response = await axios.post("http://localhost:5000/api/reservations/complete", {
        reservationId,
        userId,
      });

      if (response.data.success) {
        setReservations((prev) =>
          prev.map((res) =>
            res.ReservationID === reservationId ? { ...res, Status: "Completed" } : res
          )
        );
        setExpandedId(null);
        await fetchReservations();
      } else {
        alert("Failed to complete reservation: " + response.data.message);
      }
    } catch (err) {
      alert("Error completing reservation: " + err.message);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [userId]);

  return (
    <div className="h-screen">
      <div className="text-4xl text-theme-pink p-7 font-bold border-b">
        Reservations
      </div>

      <div className="h-full bg-gray-50 p-6 flex flex-col items-start text-theme-brown">
        {/* Navigation */}
        <div className="w-full max-w-6xl mb-6 flex space-x-4">
          <Link
            to="/staff/reservations"
            className="py-2 px-5 bg-gray-300 text-gray-800 text-base font-semibold rounded hover:bg-gray-400 transition duration-200"
          >
            All Reservations
          </Link>
          <Link
            to="/staff/reservations/upcoming"
            className="py-2 px-5 bg-theme-pink text-white text-base font-semibold rounded"
          >
            Upcoming Reservations
          </Link>
        </div>

        <div className="w-full max-w-6xl mb-4 mt-6">
          <h2 className="text-xl font-bold text-theme-pink mb-4">
            Approved Reservations for Today
          </h2>
        </div>

        {/* Loading and Error Handling */}
        {loading ? (
          <div className="text-gray-600">Loading reservations...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="w-full max-w-6xl space-y-6">
            {reservations.length === 0 ? (
              <div className="text-gray-600">No approved reservations today.</div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.ReservationID}
                  onClick={() => toggleExpand(res.ReservationID)}
                  className="bg-white border border-gray-300 rounded-lg shadow-md p-6"
                >
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <h3 className="text-lg font-bold text-gray-800 col-span-1 text-center">
                      {res.RestaurantName}
                    </h3>
                    <p className="text-sm text-gray-600 col-span-1 text-center">{res.UserName}</p>
                    <p className="text-sm text-gray-600 col-span-1 text-center">
                      {formatDateTime(res.ReservationTime).date}
                    </p>
                    <p className="text-sm text-gray-600 col-span-1 text-center">
                      {formatDateTime(res.ReservationTime).time}
                    </p>
                    <p className="text-sm text-gray-600 col-span-1 text-center">
                      Party: {res.People}
                    </p>
                    <div className="col-span-1 grid grid-cols-2 items-center gap-1">
                      <p
                        className={`text-sm font-semibold text-center ${
                          res.Status === "Completed" ? "text-gray-500" : "text-green-600"
                        }`}
                      >
                        {res.Status}
                      </p>
                      <button
                        className={`transition-transform duration-300 text-gray-600 hover:text-gray-800 justify-self-end ${
                          expandedId === res.ReservationID ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      expandedId === res.ReservationID ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-row justify-end gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling expansion when clicking button
                          markAsCompleted(res.ReservationID);
                        }}
                        disabled={res.Status === "Completed"}
                        className={`w-1/6 py-3 px-4 text-sm font-semibold rounded transition duration-200 ${
                          res.Status === "Completed"
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-theme-pink hover:bg-pink-600 text-white"
                        }`}
                      >
                        {res.Status === "Completed" ? "Completed" : "Mark as Completed"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingReservations;
