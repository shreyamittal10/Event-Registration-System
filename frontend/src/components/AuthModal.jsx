import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthModal({ isOpen, setIsOpen }) {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  if (!isOpen) return null;

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const url = isSignup
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.msg || "Something went wrong");

      if (!isSignup) {
        if (data.token) localStorage.setItem("token", data.token);

        const role = data.role || formData.role;
        localStorage.setItem("role", role);

        setIsOpen(false);

        if (role === "student") navigate("/student");
        else if (role === "organizer") navigate("/organizer");

        console.log(`Logged in as ${role}`);
      } else {
        setSuccess("Signup successful! Please log in now.");
        setIsSignup(false);
        setFormData({ ...formData, password: "" });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-center text-2xl font-semibold mb-2 text-black">
          {isSignup ? "Sign Up" : "Log In"}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          {isSignup
            ? "Just a few details to get started."
            : "Enter your credentials to log in."}
        </p>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        {success && <p className="text-green-500 text-center mb-2">{success}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          )}

          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-black rounded-lg hover:bg-gray-900 transition"
          >
            {isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button onClick={toggleMode} className="text-white font-medium ml-1">
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
