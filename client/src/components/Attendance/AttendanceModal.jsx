import React from "react";
import { useModal } from "../../context/ModalContext";
import * as XLSX from "xlsx";

export default function AttendanceModal() {
  const { currentAttendance, handleToggleAttendanceModal } = useModal();

  const handleExportToExcel = () => {
    if (
      !currentAttendance?.present_students ||
      currentAttendance.present_students.length === 0
    ) {
      alert("No data to export.");
      return;
    }

    const data = currentAttendance.present_students.map((student) => ({
      "Student ID": student.studentID,
      Name: `${student.firstName} ${student.lastName}`,
      Email: student.email,
      "Last Attendance Time": new Date(
        student.last_attendance_time
      ).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const fileName = `Attendance_${
      currentAttendance.dateToday || "export"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div
      className="w-full h-full flex justify-center items-center p-10 bg-[#0000006a] absolute top-0 left-0 z-50"
      onClick={() => handleToggleAttendanceModal(currentAttendance)}
    >
      <div
        className="flex-1 max-w-lg flex flex-col shadow-xl rounded-xl bg-white p-8 gap-8 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-center">
          Attendance for {currentAttendance?.dateToday || "Today"}
        </h2>
        <h3 className="text-sm font-medium text-center">
          Session: {currentAttendance?.session || "N/A"}
        </h3>
        <div className="flex flex-col gap-4">
          {currentAttendance?.present_students?.length > 0 ? (
            currentAttendance.present_students.map((student, index) => (
              <div
                key={student.studentID}
                className="flex items-center gap-4 p-4 border rounded-md shadow-sm"
              >
                <img
                  src={student.studentImage}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {student.studentID}
                  </p>
                  <p className="text-xs text-gray-500">
                    Email: {student.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last Attendance:{" "}
                    {new Date(student.last_attendance_time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No students present.</p>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            onClick={handleExportToExcel}
          >
            Export to Excel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md"
            onClick={() => handleToggleAttendanceModal(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
