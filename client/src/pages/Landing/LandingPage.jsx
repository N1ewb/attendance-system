import about from "../../images/aboutt.png"
import logo from "../../images/logo.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFacebookF,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const LandingPage = () => {
  return (
    <>
      <div
        className="h-[85vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('../../images/background.png')" }}
      >
        <h2 className="text-white text-3xl md:text-4xl text-start ml-10 md:ml-[275px] pt-[20%] animate-glow">
          Making things easier
        </h2>
        <h1 className="text-white text-6xl md:text-8xl font-bold text-center -mt-2 animate-glow">
          BRINGING <span className="text-[#701515]">IOT</span> TO LIFE.
        </h1>
      </div>

      <section
        id="about"
        className="py-10 px-5 min-h-[95vh] bg-cover"
        style={{ backgroundImage: "url('../../images/bga.png')" }}
      >
        <div className="flex flex-wrap max-w-[1200px] mx-auto mt-[5%]">
          <div className="w-full md:w-1/2 p-5">
            <h1 className="text-6xl font-bold text-[#701515] text-center [text-shadow:-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff,1px_1px_0_#fff]">
              ABOUT US
            </h1>
            <p className="text-xl text-white leading-relaxed text-center mt-10 max-w-[600px] mx-auto md:my-[15%]">
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
          <div className="w-full md:w-1/2 p-5">
            <img src={about} alt="PICTURE" className="max-w-[70%] rounded-lg mx-auto" />
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#1F1E1E] text-[#ecf0f1]">
        <div className="content-footer">
          <Separator />

          <footer>
            <div className="flex justify-between mx-[10%] mt-10 flex-wrap gap-8">
              <div className="socials">
                <div className="txt">
                  <h2 className="text-xl font-bold mb-2.5">Follow Us on</h2>
                </div>
                <div className="icons flex gap-0">
                  <a href="https://facebook.com" aria-label="Facebook" className="mx-5 text-3xl text-[#ecf0f1] hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="https://github.com" aria-label="GitHub" className="mx-5 text-3xl text-[#ecf0f1] hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faGithub} />
                  </a>
                  <a href="https://youtube.com" aria-label="YouTube" className="mx-5 text-3xl text-[#ecf0f1] hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                </div>
              </div>

              <div className="contacts">
                <div className="txt">
                  <h2 className="text-xl font-bold mb-2.5">Contact Us</h2>
                </div>
                <div className="mails flex gap-2.5">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="text-base px-5 py-2 rounded-md h-auto text-black bg-white"
                  />
                  <Button className="bg-[#701515] hover:bg-[#661414] text-white px-5 py-2 rounded-md font-normal">
                    Submit
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mt-8">
              <img src={logo} alt="Logo" className="w-20" />
              <h1 className="font-bold text-2xl ml-2.5">Camera Vision</h1>
            </div>

            <p className="text-center mt-4">Copyright &copy; 2024. All rights reserved.</p>

            <div className="text-center underline my-3 pb-5">
              <a href="#Home" className="mx-5 text-xl text-[#ecf0f1] hover:text-white transition-colors">HOME</a>
              <a href="#about" className="mx-5 text-xl text-[#ecf0f1] hover:text-white transition-colors">ABOUT US</a>
              <a href="#contact" className="mx-5 text-xl text-[#ecf0f1] hover:text-white transition-colors">CONTACT US</a>
            </div>
          </footer>
        </div>
      </section>
    </>
  )
}

export default LandingPage
