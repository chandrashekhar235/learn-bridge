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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // =========================
      // SAVE TOKEN
      // =========================

      if (data.token) {
        localStorage.setItem("token", data.token);

        try {
          const payload = JSON.parse(
            atob(data.token.split(".")[1])
          );

          localStorage.setItem(
            "userId",
            payload.id
          );
        } catch (error) {
          console.error(
            "JWT decode error:",
            error
          );
        }
      }

      // =========================
      // SAVE USER
      // =========================

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        if (data.user._id) {
          localStorage.setItem(
            "userId",
            data.user._id
          );
        }
      }

      // =========================
      // TELL SOCKET PROVIDER
      // =========================

      window.dispatchEvent(
        new Event("auth-changed")
      );

      // =========================
      // VERIFY PROFILE
      // =========================

      try {
        const profileRes = await fetch(
          `${BASE_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        if (profileRes.ok) {
          const profile =
            await profileRes.json();

          localStorage.setItem(
            "user",
            JSON.stringify(profile)
          );

          if (!profile.avatar) {
            navigate("/create-profile", {
              replace: true,
            });
          } else {
            navigate("/explore", {
              replace: true,
            });
          }
        } else {
          navigate("/explore", {
            replace: true,
          });
        }
      } catch (error) {
        console.error(
          "PROFILE FETCH ERROR:",
          error
        );

        navigate("/explore", {
          replace: true,
        });
      }

      alert("Login successful!");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert(
        "Server not reachable. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Login
        </h2>

        <form
          onSubmit={submitForm}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full px-4 py-2 bg-transparent border rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full px-4 py-2 bg-transparent border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-2 rounded disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;