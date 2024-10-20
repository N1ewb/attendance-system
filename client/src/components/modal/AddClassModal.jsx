import { useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useDB } from "../../context/DBContext";

function AddClassModal({ show, setShow }) {
  const db = useDB();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const subjectcodeRef = useRef();
  const offerNumberRef = useRef();
  const descriptionRef = useRef();
  const unitsRef = useRef();

  const handleSubmit = async () => {
    const subjectcode = subjectcodeRef.current.value;
    const offernumber = offerNumberRef.current.value;
    const description = descriptionRef.current.value;
    const units = unitsRef.current.value;

    try {
      if (subjectcode && offernumber && description && units) {
        await db.MakeClass(subjectcode,offernumber, description, units);
        alert("Sucessfuly made class")
      }
    } catch (error) {
        alert("Error in making new class")
    } finally {
      handleClose();
    }
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
              <input type="text" id="Subject-cide" ref={subjectcodeRef} />
            </div>
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="offer-number">Offer Number</label>
              <input type="text" id="offer-number" ref={offerNumberRef} />
            </div>
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="description">Description</label>
              <input type="text" id="description" ref={descriptionRef} />
            </div>
            <div className="input-group flex flex-col gap-2">
              <label htmlFor="unit">units</label>
              <input type="text" id="units" ref={unitsRef} />
            </div>

          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit} type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddClassModal;
