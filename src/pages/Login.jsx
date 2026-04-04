import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data); // helpful for debugging

      if (!res.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save token
      if (data.token) {
  localStorage.setItem("token", data.token);

  // decode JWT to get userId
  const payload = JSON.parse(atob(data.token.split(".")[1]));
  localStorage.setItem("userId", payload.id);
}

      // Save userId (needed for blog ownership check)
      if (data.user && data.user._id) {
        localStorage.setItem("userId", data.user._id);
      }

      // Save user object for Navbar (avatar, name)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      alert("Login successful 🎉");

      navigate("/explore", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-center">Login</h2>

        <form onSubmit={submitForm} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;