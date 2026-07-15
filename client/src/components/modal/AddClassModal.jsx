import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useDB } from "../../context/DBContext";

function AddClassModal({ show, setShow }) {
  const db = useDB();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const handleClose = () => setShow(false);

  const subjectcodeRef = useRef();
  const offerNumberRef = useRef();
  const descriptionRef = useRef();
  const unitsRef = useRef();

  const validate = () => {
    const errs = {};
    if (!subjectcodeRef.current?.value) errs.subjectCode = "Subject code is required";
    if (!offerNumberRef.current?.value) errs.offerNumber = "Offer number is required";
    if (!descriptionRef.current?.value) errs.description = "Description is required";
    if (!unitsRef.current?.value) errs.units = "Units is required";
    else if (isNaN(Number(unitsRef.current.value)) || Number(unitsRef.current.value) < 1)
      errs.units = "Units must be a positive number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await db.MakeClass(
      subjectcodeRef.current.value,
      offerNumberRef.current.value,
      descriptionRef.current.value,
      unitsRef.current.value
    );
    setSubmitting(false);
    handleClose();
    subjectcodeRef.current.value = "";
    offerNumberRef.current.value = "";
    descriptionRef.current.value = "";
    unitsRef.current.value = "";
    setErrors({});
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add a new Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={handleSubmit}
            className="[&_input]:rounded-lg [&_input]:border-green-950 [&_input]:border-solid [&_input]:border-[1px] flex flex-col items-center w-full"
          >
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="Subject-code">Subject Code</label>
              <input type="text" id="Subject-code" ref={subjectcodeRef} />
              {errors.subjectCode && <span className="text-red-500 text-sm">{errors.subjectCode}</span>}
            </div>
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="offer-number">Offer Number</label>
              <input type="text" id="offer-number" ref={offerNumberRef} />
              {errors.offerNumber && <span className="text-red-500 text-sm">{errors.offerNumber}</span>}
            </div>
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="description">Description</label>
              <input type="text" id="description" ref={descriptionRef} />
              {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
            </div>
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="unit">Units</label>
              <input type="text" id="units" ref={unitsRef} />
              {errors.units && <span className="text-red-500 text-sm">{errors.units}</span>}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit} type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddClassModal;
