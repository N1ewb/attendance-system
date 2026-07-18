import { useRef, useState, useCallback } from "react";
import { Modal, Button } from "../ui";
import { useDB } from "../../context/DBContext";
import { toast } from "react-hot-toast";

function AddStudentModal({ id, show, setShow }) {
  const db = useDB();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("user");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const handleClose = () => {
    stopCamera();
    setShow(false);
  };

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const studentIdRef = useRef();
  const imageRef = useRef();

  const validate = () => {
    const errs = {};
    if (!firstNameRef.current?.value) errs.firstName = "First name is required";
    if (!lastNameRef.current?.value) errs.lastName = "Last name is required";
    if (!emailRef.current?.value) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailRef.current.value))
      errs.email = "Invalid email format";
    if (!studentIdRef.current?.value) errs.studentId = "Student ID is required";
    if (!imageRef.current?.files?.[0]) errs.image = "Student image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!id) {
      toast.error("No class selected.");
      return;
    }

    setSubmitting(true);
    const res = await db.AddStudent(
      id,
      firstNameRef.current.value,
      lastNameRef.current.value,
      emailRef.current.value,
      studentIdRef.current.value,
      imageRef.current.files[0]
    );
    setSubmitting(false);

    if (res.status === "success") {
      toast.success(res.message);
      e.target.reset();
      setErrors({});
      handleClose();
    } else {
      toast.error(res.message);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraError("");
  }, []);

  const startCamera = useCallback(async () => {
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      toast.error("Camera requires HTTPS in production");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOpen(true);
      setCameraError("");
    } catch (err) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Use file upload instead."
          : "Camera unavailable. Use file upload instead."
      );
    }
  }, [facingMode]);

  const flipCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    stopCamera();
    setTimeout(() => startCamera(), 300);
  }, [stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (imageRef.current) {
        imageRef.current.files = dt.files;
      }
      toast.success("Photo captured");
      stopCamera();
    }, "image/jpeg", 0.85);
  }, [facingMode, stopCamera]);

  const inputClass =
    "w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";

  return (
    <Modal
      isOpen={show}
      onClose={handleClose}
      title="Add a new Student"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="first-name" className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <input type="text" id="first-name" ref={firstNameRef} className={inputClass} />
          {errors.firstName && (
            <span className="text-red-500 text-sm">{errors.firstName}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="last-name" className="text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input type="text" id="last-name" ref={lastNameRef} className={inputClass} />
          {errors.lastName && (
            <span className="text-red-500 text-sm">{errors.lastName}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input type="email" id="email" ref={emailRef} className={inputClass} />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="student-id" className="text-sm font-medium text-gray-700">
            Student ID Number
          </label>
          <input type="text" id="student-id" ref={studentIdRef} className={inputClass} />
          {errors.studentId && (
            <span className="text-red-500 text-sm">{errors.studentId}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Student Photo
          </label>
          <div className="flex gap-2 flex-wrap">
            <label className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer min-h-[44px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose File
              <input
                type="file"
                id="student-image"
                ref={imageRef}
                accept="image/*"
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => (cameraOpen ? stopCamera() : startCamera())}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {cameraOpen ? "Close Camera" : "Take Photo"}
            </button>
          </div>

          {cameraError && (
            <p className="text-amber-600 text-sm mt-1">{cameraError}</p>
          )}

          {cameraOpen && (
            <div className="mt-2 rounded-lg overflow-hidden bg-black relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full max-h-[300px] object-contain ${facingMode === "user" ? "-scale-x-100" : ""}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2 p-2 bg-gray-900 justify-center">
                <button
                  type="button"
                  onClick={flipCamera}
                  className="px-3 py-1.5 text-xs text-white bg-gray-700 rounded hover:bg-gray-600 min-h-[44px]"
                >
                  Flip Camera
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-500 min-h-[44px]"
                >
                  Capture
                </button>
              </div>
            </div>
          )}

          {errors.image && (
            <span className="text-red-500 text-sm">{errors.image}</span>
          )}
        </div>

        <Button
          variant="primary"
          type="submit"
          loading={submitting}
          fullWidth
          className="mt-2"
        >
          {submitting ? "Adding..." : "Add Student"}
        </Button>
      </form>
    </Modal>
  );
}

export default AddStudentModal;
