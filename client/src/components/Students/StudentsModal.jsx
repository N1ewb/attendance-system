import { useEffect, useState } from "react"
import { useModal } from "../../context/ModalContext"
import { getStudentImageUrl } from "../../lib/api"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Avatar, AvatarImage, AvatarFallback, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "../ui"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function StudentsModal() {
  const { currentStudent, handleToggleStudentModal } = useModal()
  const [imageUrl, setImageUrl] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [encoding, setEncoding] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (currentStudent?.imageUrl) {
      getStudentImageUrl(currentStudent.imageUrl).then(({ url }) => {
        if (url) setImageUrl(url)
      })
    }
  }, [currentStudent])

  const handleClose = () => handleToggleStudentModal(currentStudent)

  const handleReEncode = async () => {
    if (!currentStudent?.id || !currentStudent?.classId) return
    setEncoding(true)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch(
        `${API_URL}/api/classes/${currentStudent.classId}/students/${currentStudent.id}/encode`,
        { method: "POST", headers: { Authorization: `Bearer ${session?.access_token || ""}` } }
      )
      const result = await res.json()
      if (result.encoding_generated) {
        toast.success("Face encoding generated.")
      } else {
        toast(result.message || "Encoding failed.")
      }
    } catch (err) {
      toast.error("Encoding failed: " + (err.message || "unreachable"))
    } finally {
      setEncoding(false)
    }
  }

  const handleDelete = async () => {
    if (!currentStudent?.id || !currentStudent?.classId) return
    setShowDeleteConfirm(false)

    setDeleting(true)
    try {
      if (currentStudent.imageUrl) {
        await supabase.storage.from("student-images").remove([currentStudent.imageUrl])
      }
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", currentStudent.id)
      if (error) throw error
      toast.success("Student deleted.")
      handleClose()
    } catch {
      toast.error("Failed to delete student.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
    <Dialog open={true} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStudent?.firstName} {currentStudent?.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <Avatar className="h-[250px] w-[250px] rounded-full border-4 border-green-500 shadow-lg">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt="student" className="object-cover" />
            ) : (
              <></>
            )}
            <AvatarFallback className="text-6xl bg-gray-100 text-gray-400 border-4 border-gray-300">
              {currentStudent?.firstName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-800">
            Full Name:{" "}
            <span className="font-normal text-green-600">
              {currentStudent?.firstName} {currentStudent?.lastName}
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-800">
            Student ID Number:{" "}
            <span className="font-normal text-gray-600">
              {currentStudent?.studentId}
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-800">
            Email:{" "}
            <span className="font-normal text-gray-600">
              {currentStudent?.email}
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-800">
            Total Attendance:{" "}
            <span className="font-normal text-green-600">
              {currentStudent?.totalAttendance || 0}
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-800">
            Last Attendance:{" "}
            <span className="font-normal text-gray-600">
              {currentStudent?.lastAttendanceTime
                ? new Date(currentStudent.lastAttendanceTime).toLocaleDateString()
                : "N/A"}
            </span>
          </p>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
            >
              Delete
            </Button>
            {currentStudent?.imageUrl && (
              <Button
                variant="primary"
                onClick={handleReEncode}
                loading={encoding}
                size="sm"
              >
                {encoding ? "Encoding..." : "Re-encode"}
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={handleClose} size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {currentStudent?.firstName} {currentStudent?.lastName}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
