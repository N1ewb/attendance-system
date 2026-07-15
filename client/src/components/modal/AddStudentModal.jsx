import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useDB } from "../../context/DBContext";
import { toast } from "react-hot-toast";

function AddStudentModal({ id, show, setShow }) {
  const db = useDB();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const handleClose = () => setShow(false);

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
    else if (!/\S+@\S+\.\S+/.test(emailRef.current.value)) errs.email = "Invalid email format";
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

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add a new Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full gap-4"
        >
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="first-name">First Name</label>
            <input type="text" id="first-name" ref={firstNameRef} />
            {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="last-name">Last Name</label>
            <input type="text" id="last-name" ref={lastNameRef} />
            {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" ref={emailRef} />
            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="student-id">Student ID Number</label>
            <input type="text" id="student-id" ref={studentIdRef} />
            {errors.studentId && <span className="text-red-500 text-sm">{errors.studentId}</span>}
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="student-image">Student 2x2 Image</label>
            <input type="file" id="student-image" ref={imageRef} accept="image/*" />
            {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
          </div>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Submit"}
          </Button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddStudentModal;
