import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { toCamelCase, toCamelCaseArray } from "../../../lib/mapper";

export const ClassDetail = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classId = queryParams.get("id");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      setError("No class ID provided.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: classResult, error: classErr } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (classErr) {
        setError(classErr.message);
        setLoading(false);
        return;
      }

      const { data: studentsResult } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", classId);

      setClassData(toCamelCase(classResult));
      setStudents(toCamelCaseArray(studentsResult || []));
      setLoading(false);
    };

    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="h-screen w-full pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full pt-24 flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="h-screen w-full pt-24 flex items-center justify-center">
        <p className="text-gray-500">Class not found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full pt-24 p-10">
      <h1 className="font-bold text-[28px]">{classData.subjectCode}</h1>
      <p className="text-gray-600">
        {classData.offerNumber} &mdash; {classData.description}
      </p>
      <p className="text-gray-500 text-sm">Units: {classData.units}</p>

      <div className="mt-8">
        <h2 className="font-semibold text-[20px] mb-4">Students</h2>
        {students.length === 0 ? (
          <p className="text-gray-500">No students enrolled.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s) => (
              <div key={s.id} className="p-4 border rounded-lg shadow-sm">
                <p className="font-semibold">{s.firstName} {s.lastName}</p>
                <p className="text-sm text-gray-500">ID: {s.studentId}</p>
                <p className="text-sm text-gray-500">Email: {s.email}</p>
                <p className="text-sm text-gray-500">
                  Attendance: {s.totalAttendance}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
