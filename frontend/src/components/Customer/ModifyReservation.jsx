import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronDown, ChevronUp } from "lucide-react";

const ModifyReservation = () => {
  const restaurantName = "Olive Garden";

  const [showTimeSection, setShowTimeSection] = useState(false);
  const [showTableSection, setShowTableSection] = useState(false);
  const [showRequestSection, setShowRequestSection] = useState(false);

  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [specialRequest, setSpecialRequest] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");

  const tables = [
    {
      id: 1,
      name: "Table 1",
      capacity: 2,
      status: "Available",
      description: "Cozy table for two by the window.",
    },
    {
      id: 2,
      name: "Table 2",
      capacity: 4,
      status: "Occupied",
      description: "Close to the kitchen, great for quick service.",
    },
    {
      id: 3,
      name: "Table 3",
      capacity: 6,
      status: "Reserved",
      description: "Reserved for a large party in the evening.",
    },
    {
      id: 4,
      name: "Table 4",
      capacity: 4,
      status: "Available",
      description: "Near the entrance, a great spot for people-watching.",
    },
    {
      id: 5,
      name: "Table 5",
      capacity: 2,
      status: "Available",
      description: "Perfect for a romantic dinner.",
    },
    {
      id: 6,
      name: "Table 6",
      capacity: 4,
      status: "Occupied",
      description: "Great for a group of friends.",
    },
  ];

  const handleSubmit = () => {
    const updatedData = {
      ...(selectedDateTime && { time: selectedDateTime }),
      ...(selectedTableId && { tableId: selectedTableId }),
      ...(specialRequest && { specialRequest }),
    };
    console.log("Submitting changes:", updatedData);
  };

  const filteredTables = tables.filter(
    (t) =>
      t.status === "Available" &&
      (capacityFilter === "" || t.capacity === parseInt(capacityFilter))
  );

  return (
    <div className="min-h-screen bg-gray-50 text-theme-brown">
      <div className="text-4xl text-theme-pink p-7 font-bold border-b">
        Reservations
      </div>
      <div className="text-center pt-6">
        <p className="text-4xl font-bold text-theme-pink">{restaurantName}</p>
        <h1 className="text-2xl font-semibold text-theme-pink mt-1">
          Modify Reservation
        </h1>
      </div>

      <div className="flex justify-center items-center mt-6">
        <div className="w-full max-w-4xl p-6">
          {/* Time Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center cursor-pointer bg-white p-4 rounded shadow"
              onClick={() => setShowTimeSection(!showTimeSection)}
            >
              <h2 className="text-xl font-semibold">
                Would you like to change time?
              </h2>
              {showTimeSection ? <ChevronUp /> : <ChevronDown />}
            </div>
            {showTimeSection && (
              <div className="mt-2 p-4 bg-white border rounded">
                <DatePicker
                  selected={selectedDateTime}
                  onChange={(date) => setSelectedDateTime(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select new date and time"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center cursor-pointer bg-white p-4 rounded shadow"
              onClick={() => setShowTableSection(!showTableSection)}
            >
              <h2 className="text-xl font-semibold">
                Would you like to change your table?
              </h2>
              {showTableSection ? <ChevronUp /> : <ChevronDown />}
            </div>
            {showTableSection && (
              <div className="mt-2 p-4 bg-white border rounded">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Filter by Capacity
                  </label>
                  <select
                    value={capacityFilter}
                    onChange={(e) => setCapacityFilter(e.target.value)}
                    className="w-40 p-2 border rounded"
                  >
                    <option value="">All</option>
                    <option value="2">2 people</option>
                    <option value="4">4 people</option>
                    <option value="6">6 people</option>
                    <option value="8">8 people</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTables.length > 0 ? (
                    filteredTables.map((table) => (
                      <div
                        key={table.TableID}
                        className={`p-4 border rounded shadow cursor-pointer ${
                          selectedTableId === table.id
                            ? "border-pink-500 bg-pink-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedTableId(table.id)}
                      >
                        <h3 className="text-lg font-semibold">{table.name}</h3>
                        <p className="text-sm text-gray-700">
                          <strong>Capacity:</strong> {table.capacity}
                        </p>
                        <p className="text-sm text-gray-700">
                          {table.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      No available tables match the selected capacity.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Special Request Section */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer bg-white p-4 rounded shadow"
              onClick={() => setShowRequestSection(!showRequestSection)}
            >
              <h2 className="text-xl font-semibold">
                Would you like to change your request?
              </h2>
              {showRequestSection ? <ChevronUp /> : <ChevronDown />}
            </div>
            {showRequestSection && (
              <div className="mt-2 p-4 bg-white border rounded">
                <textarea
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="Enter your new request..."
                  rows="4"
                  className="w-full p-2 border rounded resize-none"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-theme-pink text-white rounded hover:bg-pink-600 transition"
          >
            Submit Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyReservation;
