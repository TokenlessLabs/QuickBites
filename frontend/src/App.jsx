import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import CustomerLayout from "./components/Customer/CustomerLayout";
import CustomerRestaurants from "./components/Customer/Restaurants";
import CustomerRestaurantDetails from "./components/Customer/RestaurantDetails";
import CustomerRestaurantReserve from "./components/Customer/RestaurantReservation";
import CustomerRestaurantReviews from "./components/Customer/RestaurantReviews";
import CustomerCurrentReservations from "./components/Customer/CurrentReservations";
import CustomerCurrentReservationsModify from "./components/Customer/ModifyReservation";
import CustomerPastReservations from "./components/Customer/PastReservations";
import CustomerReservationConfirmation from "./components/Customer/ReservationConfirmation";
import CustomerReservationPayment from "./components/Customer/ReservationPayment";
import CustomerAddReviews from "./components/Customer/AddReviews";
import CustomerPastReviews from "./components/Customer/PastReviews";
import CustomerPayments from "./components/Customer/Payments";
import CustomerProfile from "./components/Customer/Profile";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminRestaurants from "./components/Admin/Restaurants";
import AdminRestaurantDetails from "./components/Admin/RestaurantDetails";
import AdminRestaurantReviews from "./components/Admin/RestaurantReviews";
import AdminRestaurantAdmins from "./components/Admin/RestaurantAdmins";
import AdminRestaurantStaff from "./components/Admin/RestaurantStaff";
import AdminNewRestaurant from "./components/Admin/NewRestaurant";
import AdminProfile from "./components/Admin/Profile";
import StaffLayout from "./components/Staff/StaffLayout";
import StaffReservations from "./components/Staff/Reservations";
import StaffUpcomingReservations from "./components/Staff/UpcomingReservations";
import StaffTables from "./components/Staff/Tables";
import StaffProfile from "./components/Staff/Profile";

const ProtectedRoute = ({ role, children }) => {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  if (!token) return <Navigate to="/" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/customer" element={<ProtectedRoute role="Customer"><CustomerLayout /></ProtectedRoute>}>
          <Route path="restaurants" element={<CustomerRestaurants />} />
          <Route
            path="restaurants/details"
            element={<CustomerRestaurantDetails />}
          />
          <Route
            path="restaurants/reserve"
            element={<CustomerRestaurantReserve />}
          />
          <Route
            path="restaurants/reservations/confirmation"
            element={<CustomerReservationConfirmation />}
          />
          <Route
            path="restaurants/reservations/payment"
            element={<CustomerReservationPayment />}
          />
          <Route
            path="restaurants/reviews"
            element={<CustomerRestaurantReviews />}
          />
          <Route
            path="reservations"
            element={<CustomerCurrentReservations />}
          />
          <Route
            path="reservations/modify"
            element={<CustomerCurrentReservationsModify />}
          />
          <Route
            path="reservations/past"
            element={<CustomerPastReservations />}
          />
          <Route path="reviews" element={<CustomerAddReviews />} />
          <Route path="reviews/past" element={<CustomerPastReviews />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route
            path="restaurants/details"
            element={<AdminRestaurantDetails />}
          />
          <Route
            path="restaurants/reviews"
            element={<AdminRestaurantReviews />}
          />
          <Route
            path="restaurants/admins"
            element={<AdminRestaurantAdmins />}
          />
          <Route path="restaurants/staff" element={<AdminRestaurantStaff />} />
          <Route path="new/restaurant" element={<AdminNewRestaurant />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/staff" element={<ProtectedRoute role="Staff"><StaffLayout /></ProtectedRoute>}>
          <Route path="reservations" element={<StaffReservations />} />
          <Route
            path="reservations/upcoming"
            element={<StaffUpcomingReservations />}
          />
          <Route path="tables" element={<StaffTables />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
