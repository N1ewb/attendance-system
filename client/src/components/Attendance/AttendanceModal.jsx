import { useEffect, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { getAttendanceRecords } from "../../lib/api";
import { toCamelCaseArray } from "../../lib/mapper";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

export default function AttendanceModal() {
  const { currentAttendance, handleToggleAttendanceModal } = useModal();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentAttendance?.id) return;
    setLoading(true);
    getAttendanceRecords(currentAttendance.id).then(({ data }) => {
      if (data) {
        const mapped = toCamelCaseArray(data);
        setRecords(mapped);
      }
      setLoading(false);
    });
  }, [currentAttendance?.id]);

  const handleExportToExcel = () => {
    if (records.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const data = records.map((record) => {
      const student = record.students || {};
      return {
        "Student ID": student.studentId,
        Name: `${student.firstName || ""} ${student.lastName || ""}`,
        Email: student.email,
        "Time In": record.timeIn
          ? new Date(record.timeIn).toLocaleString()
          : "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const fileName = `Attendance_${
      currentAttendance?.date || "export"
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
          Attendance for {currentAttendance?.date || "Today"}
        </h2>
        <h3 className="text-sm font-medium text-center">
          Session: {currentAttendance?.sessionName || "N/A"}
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700" />
          </div>
        ) : records.length > 0 ? (
          <div className="flex flex-col gap-4 max-h-[400px] overflow-auto">
            {records.map((record, index) => {
              const student = record.students || {};
              return (
                <div
                  key={record.id || index}
                  className="flex items-center gap-4 p-4 border rounded-md shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                    {student.firstName?.charAt(0) || "?"}
                  </div>
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
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No attendance records for this session.
          </p>
        )}

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
