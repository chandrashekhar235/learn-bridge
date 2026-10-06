import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("GOOGLE CLIENT ID:", GOOGLE_CLIENT_ID);
export default function GoogleAuthButton() {
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: async (response) => {
          try {
            const res = await fetch(
              `${BASE_URL}/google`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  credential: response.credential,
                }),
              }
            );

            const data = await res.json();

            if (!res.ok) {
              throw new Error(
                data.message || "Google login failed"
              );
            }

            // Save LearnBridge JWT
            localStorage.setItem(
              "token",
              data.token
            );

            // Save user
            localStorage.setItem(
              "user",
              JSON.stringify(data.user)
            );

            // Save user ID
            localStorage.setItem(
              "userId",
              data.user.id
            );

            navigate("/explore", {
              replace: true,
            });

            window.location.reload();
          } catch (error) {
            console.error(
              "GOOGLE AUTH ERROR:",
              error
            );

            alert(
              error.message ||
                "Google authentication failed"
            );
          }
        },
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 350,
          text: "continue_with",
          shape: "rectangular",
        }
      );
    };

    if (window.google) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate]);

  return (
    <div
      ref={googleButtonRef}
      className="flex justify-center"
      
    />
  );
}