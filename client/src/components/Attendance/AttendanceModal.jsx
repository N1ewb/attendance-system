import { useEffect, useState } from "react"
import { useModal } from "../../context/ModalContext"
import { getAttendanceRecords } from "../../lib/api"
import { toCamelCaseArray } from "../../lib/mapper"
import { toast } from "react-hot-toast"
import { supabase } from "../../lib/supabase"
import * as XLSX from "xlsx"
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Avatar, AvatarFallback, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "../ui"

export default function AttendanceModal() {
  const { currentAttendance, handleToggleAttendanceModal } = useModal()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentAttendance?.id) return
    setLoading(true)
    getAttendanceRecords(currentAttendance.id).then(({ data }) => {
      if (data) {
        const mapped = toCamelCaseArray(data)
        setRecords(mapped)
      }
      setLoading(false)
    })
  }, [currentAttendance?.id])

  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleClose = () => handleToggleAttendanceModal(null)

  const handleDeleteSession = async () => {
    if (!currentAttendance?.id) return
    setShowDeleteConfirm(false)
    setDeleting(true)
    try {
      const { error } = await supabase
        .from("attendance_sessions")
        .delete()
        .eq("id", currentAttendance.id)
      if (error) throw error
      toast.success("Session deleted.")
      handleClose()
    } catch {
      toast.error("Failed to delete session.")
    } finally {
      setDeleting(false)
    }
  }

  const handleExportToExcel = () => {
    if (records.length === 0) {
      toast.error("No data to export.")
      return
    }

    const data = records.map((record) => {
      const student = record.students || {}
      return {
        "Student ID": student.studentId,
        Name: `${student.firstName || ""} ${student.lastName || ""}`,
        Email: student.email,
        "Time In": record.timeIn
          ? new Date(record.timeIn).toLocaleString()
          : "N/A",
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance")

    const fileName = `Attendance_${
      currentAttendance?.date || "export"
    }.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  return (
    <>
    <Dialog open={true} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentAttendance?.date || "Today"}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm font-medium text-center -mt-2">
          Session: {currentAttendance?.sessionName || "N/A"}
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700" />
          </div>
        ) : records.length > 0 ? (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-auto">
            {records.map((record, index) => {
              const student = record.students || {}
              return (
                <div
                  key={record.id || index}
                  className="flex items-center gap-4 p-4 border rounded-md"
                >
                  <Avatar className="h-10 w-10 bg-gray-200">
                    <AvatarFallback className="bg-gray-200 text-gray-500 font-bold">
                      {student.firstName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">
                      {student.firstName || "Unknown"}{" "}
                      {student.lastName || ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {student.studentId || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Time In:{" "}
                      {record.timeIn
                        ? new Date(record.timeIn).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No attendance records for this session.
          </p>
        )}

        <DialogFooter>
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleExportToExcel}
              size="sm"
            >
              Export to Excel
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
            >
              Delete
            </Button>
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
          <AlertDialogTitle>Delete Session</AlertDialogTitle>
          <AlertDialogDescription>
            Delete this attendance session and all its records? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteSession}
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
