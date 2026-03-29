import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <div className="button-container">
        <Link to="/explore" style={{ textDecoration: "none" }}>
          <button className="space-button">
            <div className="bright-particles" />
            <span>Explore </span>
          </button>
        </Link>

      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .space-button {
    position: relative;
    padding: 15px 40px;
    font-size: 16px;
    color: rgba(255, 255, 255, 1);
    background: linear-gradient(45deg, #0f0f2d, #1a1a3a);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 4px 10px rgba(10, 10, 31, 0.5),
      0 0 10px rgba(66, 135, 245, 0.15),
      inset 0 0 10px rgba(66, 135, 245, 0.05);
    font-family: "Arial", sans-serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    z-index: 1;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform;
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.3),
      0 0 20px rgba(255, 255, 255, 0.1);
    font-weight: 500;
  }

  .button-container {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(90deg, #00c6ff, #845ec2, #ff6f91, #00c6ff);
    background-size: 400% 400%;
    animation: gradientBorder 20s ease-in-out infinite;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform, filter;
    backdrop-filter: blur(5px);
  }

  .space-button span {
    position: relative;
    z-index: 5;
    mix-blend-mode: normal;
    font-weight: 500;
    background: linear-gradient(to right, #ffffff, #ffffff);
    -webkit-background-clip: text;
    background-clip: text;
    filter: brightness(1.5) contrast(1.8);
    text-shadow:
      0 0 15px rgba(255, 255, 255, 0.6),
      0 0 30px rgba(255, 255, 255, 0.3);
  }

  .space-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        1px 1px at 10% 15%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1.5px 1.5px at 85% 25%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1px 1px at 75% 85%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1.5px 1.5px at 15% 75%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1px 1px at 50% 25%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1.5px 1.5px at 25% 50%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1px 1px at 85% 65%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      );
    animation: moveParticles1 20s linear infinite;
    opacity: 0.45;
    pointer-events: none;
    will-change: transform;
    z-index: 2;
  }

  .space-button::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    animation: moveParticles2 18s linear infinite;
    transform: rotate(25deg);
    opacity: 0.55;
    pointer-events: none;
    will-change: transform;
    z-index: 3;
  }

  .space-button:hover {
    transform: translateY(-1px) translateZ(0);
    box-shadow:
      0 6px 10px rgba(10, 10, 31, 0.6),
      0 0 15px rgba(66, 135, 245, 0.3),
      inset 0 0 15px rgba(66, 135, 245, 0.1);
    background: linear-gradient(45deg, #141436, #1e1e42);
  }

  .space-button:hover span {
    filter: brightness(1.8) contrast(2);
    text-shadow:
      0 0 20px rgba(255, 255, 255, 0.8),
      0 0 40px rgba(255, 255, 255, 0.4),
      0 0 60px rgba(255, 255, 255, 0.2);
  }

  .button-container:hover {
    filter: brightness(1.1);
    box-shadow:
      0 0 25px rgba(0, 0, 0, 0.4),
      0 0 10px rgba(66, 135, 245, 0.2);
    backdrop-filter: blur(8px);
    animation: gradientBorder 10s ease-in-out infinite;
  }

  .space-button:hover::before {
    opacity: 0.65;
  }

  .space-button:hover::after {
    opacity: 0.75;
  }

  .space-button:hover .bright-particles {
    opacity: 1;
    filter: blur(0);
  }

  @keyframes moveParticles1 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    20% {
      transform: translate(-25px, 15px) rotate(90deg);
    }
    40% {
      transform: translate(20px, -20px) rotate(180deg);
    }
    60% {
      transform: translate(-15px, -25px) rotate(270deg);
    }
    80% {
      transform: translate(25px, 20px) rotate(320deg);
    }
    100% {
      transform: translate(0, 0) rotate(360deg);
    }
  }

  @keyframes moveParticles2 {
    0% {
      transform: translate(0, 0) rotate(20deg);
    }
    25% {
      transform: translate(20px, -15px) rotate(110deg);
    }
    50% {
      transform: translate(-20px, 20px) rotate(200deg);
    }
    75% {
      transform: translate(15px, 15px) rotate(290deg);
    }
    100% {
      transform: translate(0, 0) rotate(380deg);
    }
  }

  @keyframes gradientBorder {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Yeni parlak parçacık katmanı */
  .space-button .bright-particles {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        2px 2px at 15% 25%,
        rgba(255, 255, 255, 1),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1.8px 1.8px at 85% 15%,
        rgba(255, 255, 255, 0.98),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        2px 2px at 75% 75%,
        rgba(255, 255, 255, 1),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        1.5px 1.5px at 25% 85%,
        rgba(255, 255, 255, 0.95),
        rgba(0, 0, 0, 0)
      ),
      radial-gradient(
        2.2px 2.2px at 65% 35%,
        rgba(255, 255, 255, 1),
        rgba(0, 0, 0, 0)
      );
    animation: moveParticles4 15s linear infinite;
    opacity: 0.85;
    mix-blend-mode: screen;
    pointer-events: none;
    will-change: transform;
    z-index: 4;
    filter: blur(0.3px);
  }

  @keyframes moveParticles4 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    20% {
      transform: translate(-30px, 20px) rotate(90deg);
    }
    40% {
      transform: translate(25px, -25px) rotate(180deg);
    }
    60% {
      transform: translate(-20px, -30px) rotate(270deg);
    }
    80% {
      transform: translate(30px, 25px) rotate(320deg);
    }
    100% {
      transform: translate(0, 0) rotate(360deg);
    }
  }`;

export default Button;
