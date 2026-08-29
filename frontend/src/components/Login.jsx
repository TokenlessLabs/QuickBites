import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/Logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authRes = await axios.post(
        "http://localhost:5000/api/users/authenticate",
        {
          username,
          password,
        }
      );

      const user = authRes.data.data;
      const restaurantId = authRes.data.id;
      const authToken = authRes.data.token;
      // Save user info
      localStorage.setItem("userId", JSON.stringify(user.UserID));
      localStorage.setItem("userRole", user.Role);
      localStorage.setItem("authToken", authToken);
      axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      if (restaurantId) {
        localStorage.setItem("restaurantId", restaurantId);
      } else {
        localStorage.removeItem("restaurantId");
      }

      const userRole = user.Role;

      // Navigate based on role
      if (userRole === "Admin") {
        navigate("/admin/restaurants");
      } else if (userRole === "Staff") {        
       navigate("/staff/reservations");
      } else {
        navigate("/customer/restaurants");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-row text-theme-brown bg-gray-100">
      <div className="w-1/2 flex items-center justify-center bg-white rounded-r-[20%]">
        <img src={Logo} alt="Logo" className="w-full object-contain p-10" />
      </div>

      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col gap-6 rounded-2xl w-[80%] max-w-md p-10 bg-white shadow-2xl">
          <h2 className="text-2xl font-semibold text-center">
            Login to Your Account
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Ali123"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-pink"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-pink"
                required
              />
              <label className="text-xs mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="accent-theme-pink"
                />
                Show Password
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-theme-pink text-white rounded px-4 py-2 hover:bg-pink-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-theme-pink hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
