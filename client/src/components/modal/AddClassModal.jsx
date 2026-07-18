import { useRef, useState } from "react";
import { Modal, Button } from "../ui";
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

  const inputClass =
    "w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";

  return (
    <Modal
      isOpen={show}
      onClose={handleClose}
      title="Add a new Class"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {submitting ? "Creating..." : "Submit"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="Subject-code" className="text-sm font-medium text-gray-700">
            Subject Code
          </label>
          <input type="text" id="Subject-code" ref={subjectcodeRef} className={inputClass} />
          {errors.subjectCode && (
            <span className="text-red-500 text-sm">{errors.subjectCode}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="offer-number" className="text-sm font-medium text-gray-700">
            Offer Number
          </label>
          <input type="text" id="offer-number" ref={offerNumberRef} className={inputClass} />
          {errors.offerNumber && (
            <span className="text-red-500 text-sm">{errors.offerNumber}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <input type="text" id="description" ref={descriptionRef} className={inputClass} />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="units" className="text-sm font-medium text-gray-700">
            Units
          </label>
          <input type="text" id="units" ref={unitsRef} className={inputClass} />
          {errors.units && (
            <span className="text-red-500 text-sm">{errors.units}</span>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default AddClassModal;
