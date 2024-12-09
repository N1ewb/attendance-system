import { useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useDB } from "../../context/DBContext";

function AddStudentModal({ id, show, setShow }) {
  const db = useDB();
  const handleClose = () => setShow(false);

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const studentIdRef = useRef();
  const imageRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstName = firstNameRef.current.value;
    const lastName = lastNameRef.current.value;
    const email = emailRef.current.value;
    const studentId = studentIdRef.current.value;
    const imageFile = imageRef.current.files[0];

    if (!firstName || !lastName || !email || !studentId || !imageFile || !id) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await db.AddStudent(id, firstName, lastName, email, studentId, imageFile);
      alert(res.message)
      e.target.reset();
    } catch (error) {
      alert("Error in adding new student");
      console.error("Error:", error);
    } finally {
      handleClose();
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
            <input type="text" id="first-name" ref={firstNameRef} required />
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="last-name">Last Name</label>
            <input type="text" id="last-name" ref={lastNameRef} required />
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" ref={emailRef} required />
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="student-id">Student ID Number</label>
            <input type="text" id="student-id" ref={studentIdRef} required />
          </div>
          <div className="input-group flex flex-col gap-2">
            <label htmlFor="student-image">Student 2x2 Image</label>
            <input type="file" id="student-image" ref={imageRef} required />
          </div>
          <Button variant="primary" type="submit">
            Submit
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
