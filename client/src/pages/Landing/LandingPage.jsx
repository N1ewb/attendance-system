import React from "react";
import { Link } from "react-router-dom";
import about from "../../images/aboutt.png";
import logo from "../../images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <>
      <div className="bg">
        <h2 className="top-text">Making things easier</h2>
        <h1 className="center-text">
          BRINGING <span>IOT</span> TO LIFE.
        </h1>
      </div>

      <section id="about">
        <p>.</p>
        <div className="container">
          <div className="right-page">
            <h1>ABOUT US</h1>
            <p>
              Nathaniel Lucero and Dexter Basergo aims to upgrade the attendance
              tracking during class by using the camera vision. The main
              objective of this system is to automate the attendance tracking
              and help the instructor and student to have a smoother experience.
              The goal of this project is to streamline and to enhance the
              accuracy in attendance tracking. Also, the team wants the student
              to have the opportunity to experience having real-time attendance
              by just using python open cv.
            </p>
          </div>
          <div className="left-page">
            <img src={about} alt="PICTURE" />
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="content-footer">
          <hr />
          <footer>
            <div className="fcontainer">
              <div className="socials">
                <div className="txt">
                  <h2>Follow Us on</h2>
                </div>

                <div className="icons">
                  <a href="https://facebook.com" aria-label="Facebook">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="https://github.com" aria-label="GitHub">
                    <FontAwesomeIcon icon={faGithub} />
                  </a>
                  <a href="https://youtube.com" aria-label="YouTube">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                </div>
              </div>
              <div className="contacts">
                <div className="txt">
                  <h2>Contact Us</h2>
                </div>
                <div className="mails">
                  <input type="email" placeholder="Enter your email" />
                  <button>Submit</button>
                </div>
              </div>
            </div>
            <div className="logo">
              {" "}
              <img src={logo} alt="Logo" />
              <h1> Camera Vision</h1>
            </div>
            <p>Copyright &copy; 2024. All rights reserved.</p>
            <div className="nav-links">
              <a href="#Home">HOME</a>
              <a href="#about">ABOUT US</a>
              <a href="#contact">CONTACT US</a>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
