import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filterOption, setFilterOption] = useState("all");
  const [sortOption, setSortOption] = useState("time-asc");
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userId");

  // Fetch reservations when component mounts or filter/sort options change
  const fetchReservations = async () => {
    try {
      const statusQuery =
        filterOption === "all" ? "Pending,Approved" : filterOption;
      const response = await axios.get(
        `http://localhost:5000/api/reservations-user`,
        {
          params: { userId, status: statusQuery },
        }
      );
      setReservations(response.data.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Treat 404 as no reservations found
        setReservations([]);
      } else {
        console.error("Error fetching reservations:", error);
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterOption, sortOption, userId]);

  const toggleExpand = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleCancel = async (reservationId) => {
    try {
      await axios.delete("http://localhost:5000/api/reservations", {
        data: { reservationId, userId },
      });
      setShowModal(true);
      fetchReservations(); // refresh list from backend
    } catch (error) {
      console.error("Error canceling reservation:", error);
    }
  };

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

  const sortedReservations = [...reservations].sort((a, b) => {
    const dateA = new Date(a.Time);
    const dateB = new Date(b.Time);
    return sortOption === "time-asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="h-screen text-theme-brown">
      <div className="text-4xl text-theme-pink p-7 font-bold border-b">
        Reservations
      </div>
      <div className="h-full bg-gray-50 p-6 flex flex-col items-start text-theme-brown">
        {/* Navigation Buttons */}
        <div className="w-full max-w-6xl mb-6 flex space-x-4">
          <Link
            to="/customer/reservations"
            className="py-2 px-5 bg-theme-pink text-white text-base font-semibold rounded"
          >
            Current Reservations
          </Link>
          <Link
            to="/customer/reservations/past"
            className="py-2 px-5 bg-gray-300 text-gray-800 text-base font-semibold rounded hover:bg-gray-400 transition duration-200"
          >
            Past Reservations
          </Link>
        </div>

        {/* Heading and Controls */}
        <div className="w-full max-w-6xl mb-4 mt-6">
          <h2 className="text-xl font-bold text-theme-pink mb-4">
            Your Current Reservations
          </h2>
          <div className="flex justify-between items-center">
            {/* Filter Dropdown */}
            <div className="flex flex-col gap-1">
              <div className="text-gray-500 text-sm">Filter By</div>
              <select
                value={filterOption}
                onChange={handleFilterChange}
                className="py-2 px-4 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-theme-pink"
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col gap-1">
              <div className="text-gray-500 text-sm">Sort By</div>
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

        {/* Reservations List */}
        <div className="w-full max-w-6xl">
          <div className="space-y-6">
            {sortedReservations.length === 0 ? (
              <div className="text-center text-gray-500 text-lg py-10">
                No current reservations found.
              </div>
            ) : (
              sortedReservations.map((reservation) => (
                <div
                  onClick={() => toggleExpand(reservation.ReservationID)}
                  key={reservation.ReservationID}
                  className="bg-white border border-gray-300 rounded-lg shadow-md p-6"
                >
                  <div className="grid grid-cols-6 gap-4 items-center">
                    {/* Restaurant Name */}
                    <h3 className="text-lg font-bold col-span-1 flex items-center justify-center">
                      {reservation.RestaurantName}
                    </h3>

                    {/* Date */}
                    <p className="text-sm col-span-1 flex items-center justify-center">
                      {formatDateTime(reservation.Time).date}
                    </p>

                    {/* Time */}
                    <p className="text-sm text-gray-600 col-span-1 flex items-center justify-center">
                      {formatDateTime(reservation.Time).time}
                    </p>

                    {/* Party Size */}
                    <p className="text-sm text-gray-600 col-span-1 flex items-center justify-center">
                      Party: {reservation.People}
                    </p>

                    {/* Duration */}
                    <p className="text-sm text-gray-600 col-span-1 flex items-center justify-center">
                      {reservation.Duration} mins
                    </p>

                    {/* Status + Expand Button */}
                    <div className="col-span-1 grid grid-cols-2 items-center gap-1">
                      <p
                        className={`text-sm font-semibold text-center ${
                          reservation.Status === "Approved"
                            ? "text-green-600"
                            : reservation.Status === "Completed"
                            ? "text-theme-pink"
                            : reservation.Status === "Cancelled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {reservation.Status}
                      </p>

                      <button
                        className={`transition-transform duration-300 text-gray-600 hover:text-gray-800 justify-self-end ${
                          expandedId === reservation.ReservationID
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Expandable Panel */}
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      expandedId === reservation.ReservationID
                        ? "max-h-40 opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex w-full justify-between">
                      <p className="flex justify-center items-center gap-1">
                        <strong>Special Request:</strong>{" "}
                        {reservation.Request || "None"}
                      </p>
                      <div className="flex w-1/2 flex-row items-center justify-end gap-4">
                        {/* <button
                          onClick={() => handleClick(reservation.ReservationID)}
                          className="w-1/3 py-3 px-4 bg-theme-pink text-white text-sm font-semibold rounded hover:bg-pink-600 transition duration-200"
                        >
                          Modify
                        </button> */}
                        <button
                          onClick={() =>
                            handleCancel(reservation.ReservationID)
                          }
                          className="w-1/3 py-3 px-4 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-500 transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-theme-pink mb-4">
              Reservation Cancelled
            </h2>
            <p className="text-gray-700 mb-6">
              Your reservation has been successfully cancelled.
            </p>
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 bg-theme-pink text-white rounded hover:bg-pink-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
