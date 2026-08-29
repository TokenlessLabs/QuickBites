import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [filterOption, setFilterOption] = useState("all");
  const [sortOption, setSortOption] = useState("time-asc");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("Please log in to view reservations.");
      setLoading(false);
      return;
    }

    const fetchReservations = async () => {
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
                "http://localhost:5000/api/reservations-rest",
                {
                  params: {
                    restaurantId: restaurant.RestaurantID,
                    status:
                      filterOption !== "all" ? filterOption : undefined,
                  },
                }
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
        setError("Failed to fetch reservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [filterOption, userId]);

  const handleFilterChange = (e) => setFilterOption(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleClick = async (reservationId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/reservations/approve", {
        reservationId,
        userId,
      });

      if (res.data.success) {
        setReservations((prev) =>
          prev.map((r) =>
            r.ReservationID === reservationId ? { ...r, Status: "Approved" } : r
          )
        );
      } else {
        alert("Failed to approve reservation.");
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert("Error approving reservation.");
    }
  };

  const handleCancel = async (reservationId) => {
    try {
      const res = await axios.delete("http://localhost:5000/api/reservations", {
        data: { reservationId, userId },
      });

      if (res.data.success) {
        setReservations((prev) =>
          prev.map((r) =>
            r.ReservationID === reservationId ? { ...r, Status: "Cancelled" } : r
          )
        );
      } else {
        alert("Failed to cancel reservation.");
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      alert("Error cancelling reservation.");
    }
  };

  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const dateA = new Date(a.ReservationTime);
      const dateB = new Date(b.ReservationTime);
      return sortOption === "time-asc" ? dateA - dateB : dateB - dateA;
    });
  }, [reservations, sortOption]);

  const formatDateTime = (isoString) => {
    const dateObj = new Date(isoString);
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="h-screen">
      <div className="text-4xl text-theme-pink p-7 font-bold border-b">Reservations</div>

      <div className="h-full bg-gray-50 p-6 flex flex-col items-start text-theme-brown">
        {/* Navigation */}
        <div className="w-full max-w-6xl mb-6 flex space-x-4">
          <Link to="/staff/reservations" className="py-2 px-5 bg-theme-pink text-white font-semibold rounded">
            All Reservations
          </Link>
          <Link to="/staff/reservations/upcoming" className="py-2 px-5 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400">
            Upcoming Reservations
          </Link>
        </div>

        {/* Controls */}
        <div className="w-full max-w-6xl mb-4 mt-6">
          <h2 className="text-xl font-bold text-theme-pink mb-4">Your Current Reservations</h2>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-sm">Filter By</label>
              <select
                value={filterOption}
                onChange={handleFilterChange}
                className="py-2 px-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-theme-pink"
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-sm">Sort By</label>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="py-2 px-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-theme-pink"
              >
                <option value="time-asc">Time Ascending</option>
                <option value="time-desc">Time Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservation List */}
        {loading ? (
          <p className="text-gray-500 p-4">Loading reservations...</p>
        ) : error ? (
          <p className="text-red-500 p-4">{error}</p>
        ) : sortedReservations.length === 0 ? (
          <p className="text-gray-500 p-4">No reservations to display.</p>
        ) : (
          <div className="w-full max-w-6xl space-y-6">
            {sortedReservations.map((reservation) => (
              <div
                key={reservation.ReservationID}
                onClick={() => toggleExpand(reservation.ReservationID)}
                className="bg-white border border-gray-300 rounded-lg shadow-md p-6 cursor-pointer"
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  <h3 className="text-lg font-bold text-gray-800 col-span-1 text-center">
                    {reservation.RestaurantName}
                  </h3>
                  <p className="text-sm text-gray-600 col-span-1 text-center">{reservation.UserName}</p>
                  <p className="text-sm text-gray-600 col-span-1 text-center">{formatDateTime(reservation.ReservationTime).date}</p>
                  <p className="text-sm text-gray-600 col-span-1 text-center">{formatDateTime(reservation.ReservationTime).time}</p>
                  <p className="text-sm text-gray-600 col-span-1 text-center">Party: {reservation.NumGuests}</p>

                  <div className="col-span-1 grid grid-cols-2 items-center gap-1">
                    <p className={`text-sm font-semibold text-center ${
                      reservation.Status === "Approved"
                        ? "text-green-600"
                        : reservation.Status === "Completed"
                        ? "text-theme-pink"
                        : reservation.Status === "Cancelled"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}>{reservation.Status}</p>
                    <button
                      className={`transition-transform duration-300 text-gray-600 hover:text-gray-800 justify-self-end ${
                        expandedId === reservation.ReservationID ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Expandable Content */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    expandedId === reservation.ReservationID ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex w-full justify-between">
                    <p className="flex justify-center items-center gap-1">
                      <strong>Special Request:</strong>{" "}
                      {reservation.SpecialRequest || "None"}
                    </p>
                    {reservation.Status === "Pending" && (
                      <div className="flex w-1/2 flex-row items-center justify-end gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(reservation.ReservationID);
                          }}
                          className="w-1/3 py-3 px-4 bg-theme-pink text-white text-sm font-semibold rounded hover:bg-pink-600 transition duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(reservation.ReservationID);
                          }}
                          className="w-1/3 py-3 px-4 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-500 transition duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
