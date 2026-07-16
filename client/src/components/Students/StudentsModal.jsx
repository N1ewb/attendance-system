import { useEffect, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { getStudentImageUrl } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StudentsModal() {
  const { currentStudent, handleToggleStudentModal } = useModal();
  const [imageUrl, setImageUrl] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [encoding, setEncoding] = useState(false);

  useEffect(() => {
    if (currentStudent?.imageUrl) {
      getStudentImageUrl(currentStudent.imageUrl).then(({ url }) => {
        if (url) setImageUrl(url);
      });
    }
  }, [currentStudent]);

  const handleReEncode = async () => {
    if (!currentStudent?.id || !currentStudent?.classId) return;
    setEncoding(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(
        `${API_URL}/api/classes/${currentStudent.classId}/students/${currentStudent.id}/encode`,
        { method: "POST", headers: { Authorization: `Bearer ${session?.access_token || ""}` } }
      );
      const result = await res.json();
      if (result.encoding_generated) {
        toast.success("Face encoding generated.");
      } else {
        toast(result.message || "Encoding failed.");
      }
    } catch {
      toast.error("Encoding server unreachable at " + API_URL);
    } finally {
      setEncoding(false);
    }
  };

  const handleDelete = async () => {
    if (!currentStudent?.id || !currentStudent?.classId) return;
    if (!window.confirm(`Delete ${currentStudent.firstName} ${currentStudent.lastName}?`)) return;

    setDeleting(true);
    try {
      if (currentStudent.imageUrl) {
        await supabase.storage.from("student-images").remove([currentStudent.imageUrl]);
      }
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", currentStudent.id);
      if (error) throw error;
      toast.success("Student deleted.");
      handleToggleStudentModal(currentStudent);
    } catch (err) {
      toast.error("Failed to delete student.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="w-full h-full flex justify-center items-center p-10 bg-[#0000006a] absolute top-0 left-0 z-50"
      onClick={() => handleToggleStudentModal(currentStudent)}
    >
      <div
        className="flex-1 max-w-lg flex flex-col shadow-xl rounded-xl bg-white p-8 gap-8 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="student"
              className="max-h-[250px] max-w-[250px] object-cover rounded-full border-4 border-green-500 shadow-lg"
            />
          ) : (
            <div className="max-h-[250px] max-w-[250px] flex items-center justify-center rounded-full border-4 border-gray-300 bg-gray-100 shadow-lg">
              <span className="text-6xl text-gray-400">
                {currentStudent?.firstName?.charAt(0) || "?"}
              </span>
            </div>
          )}
        </div>

        <div className="student-deets flex flex-col gap-5">
          <p className="text-lg font-semibold text-gray-800">
            Full Name:{" "}
            <span className="font-normal text-green-600">
              {currentStudent?.firstName} {currentStudent?.lastName}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Student ID Number:{" "}
            <span className="font-normal text-gray-600">
              {currentStudent?.studentId}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Email:{" "}
            <span className="font-normal text-gray-600">
              {currentStudent?.email}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Total Attendance:{" "}
            <span className="font-normal text-green-600">
              {currentStudent?.totalAttendance || 0}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Last Attendance:{" "}
            <span className="font-normal text-gray-600">
              {currentStudent?.lastAttendanceTime
                ? new Date(currentStudent.lastAttendanceTime).toLocaleDateString()
                : "N/A"}
            </span>
          </p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            {currentStudent?.imageUrl && (
              <button
                onClick={handleReEncode}
                disabled={encoding}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none disabled:opacity-50"
              >
                {encoding ? "Encoding..." : "Re-encode"}
              </button>
            )}
          </div>
          <button
            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none"
            onClick={() => handleToggleStudentModal(currentStudent)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
