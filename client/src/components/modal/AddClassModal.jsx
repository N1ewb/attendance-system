import { useRef, useState } from "react"
import { Modal, Button, Input, Label } from "../ui"
import { useDB } from "../../context/DBContext"

function AddClassModal({ show, setShow }) {
  const db = useDB()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const handleClose = () => setShow(false)

  const subjectcodeRef = useRef()
  const offerNumberRef = useRef()
  const descriptionRef = useRef()
  const unitsRef = useRef()

  const validate = () => {
    const errs = {}
    if (!subjectcodeRef.current?.value) errs.subjectCode = "Subject code is required"
    if (!offerNumberRef.current?.value) errs.offerNumber = "Offer number is required"
    if (!descriptionRef.current?.value) errs.description = "Description is required"
    if (!unitsRef.current?.value) errs.units = "Units is required"
    else if (isNaN(Number(unitsRef.current.value)) || Number(unitsRef.current.value) < 1)
      errs.units = "Units must be a positive number"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    await db.MakeClass(
      subjectcodeRef.current.value,
      offerNumberRef.current.value,
      descriptionRef.current.value,
      unitsRef.current.value
    )
    setSubmitting(false)
    handleClose()
    subjectcodeRef.current.value = ""
    offerNumberRef.current.value = ""
    descriptionRef.current.value = ""
    unitsRef.current.value = ""
    setErrors({})
  }

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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="Subject-code">Subject Code</Label>
          <Input type="text" id="Subject-code" ref={subjectcodeRef} />
          {errors.subjectCode && (
            <span className="text-destructive text-sm">{errors.subjectCode}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="offer-number">Offer Number</Label>
          <Input type="text" id="offer-number" ref={offerNumberRef} />
          {errors.offerNumber && (
            <span className="text-destructive text-sm">{errors.offerNumber}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Input type="text" id="description" ref={descriptionRef} />
          {errors.description && (
            <span className="text-destructive text-sm">{errors.description}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="units">Units</Label>
          <Input type="text" id="units" ref={unitsRef} />
          {errors.units && (
            <span className="text-destructive text-sm">{errors.units}</span>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default AddClassModal
