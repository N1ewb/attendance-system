import { createContext, useContext, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "../lib/mapper";
import { getClasses, getStudents, getAttendanceSessions } from "../lib/api";
import { useAuth } from "./authContext";

const dbContext = createContext();

export function useDB() {
  return useContext(dbContext);
}

export function DBProvider({ children }) {
  const { currentUser } = useAuth();

  async function MakeClass(subjectCode, offerNumber, description, units) {
    try {
      const { data, error } = await supabase
        .from("classes")
        .insert(
          toSnakeCase({
            userId: currentUser?.id,
            subjectCode,
            offerNumber,
            description,
            units: Number(units),
          })
        )
        .select()
        .single();
      if (error) {
        toast.error("Failed to create class: " + error.message);
        return null;
      }
      toast.success("Class created successfully.");
      return toCamelCase(data);
    } catch (err) {
      toast.error("Failed to create class: " + err.message);
      return null;
    }
  }

  async function getClassInfo(id) {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Failed to load class: " + error.message);
        return null;
      }
      return toCamelCase(data);
    } catch (err) {
      toast.error("Failed to load class: " + err.message);
      return null;
    }
  }

  async function AddStudent(classId, firstName, lastName, email, studentIdInput, imageFile) {
    try {
      let imageUrl = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `${classId}/${studentIdInput}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("student-images")
          .upload(filePath, imageFile);
        if (uploadError) {
          return { status: "error", message: "Image upload failed: " + uploadError.message };
        }
        imageUrl = filePath;
      }

      const { data, error } = await supabase
        .from("students")
        .insert(
          toSnakeCase({
            classId,
            firstName,
            lastName,
            email,
            studentId: studentIdInput,
            imageUrl,
          })
        )
        .select()
        .single();
      if (error) {
        return { status: "error", message: error.message };
      }
      const newStudent = data;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) {
          toast.error("No auth token — face encoding skipped.");
          return;
        }
        const encToast = toast.loading("Generating face encoding...");
        fetch(
          `${apiUrl}/api/classes/${classId}/students/${newStudent.id}/encode`,
          { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } }
        ).then(async (res) => {
          const result = await res.json();
          toast.dismiss(encToast);
          if (result.encoding_generated) {
            toast.success("Face encoding generated.");
          } else {
            toast(result.message || "Encoding failed.");
          }
        }).catch((err) => {
          toast.dismiss(encToast);
          console.error("Encoding server error:", err);
          toast.error("Encoding failed: " + (err.message || "unreachable"));
        });
      });
      toast.success("Student added successfully.");
      return { status: "success", message: "Student added successfully.", data: toCamelCase(newStudent) };
    } catch (err) {
      return { status: "error", message: err.message };
    }
  }

  async function RecordAttendance(sessionId, studentId) {
    try {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert(toSnakeCase({ sessionId, studentId }))
        .select()
        .single();
      if (error) return { error: error.message };
      await supabase.rpc("increment_attendance", { student_id: studentId });
      return { data: toCamelCase(data), error: null };
    } catch (err) {
      return { error: err.message };
    }
  }

  const subscribetoClassesChanges = useCallback(
    (onChange) => {
      const handler = (payload) => {
        if (payload.eventType === "INSERT") {
          onChange({ type: "INSERT", data: toCamelCase(payload.new) });
        } else if (payload.eventType === "UPDATE") {
          onChange({ type: "UPDATE", data: toCamelCase(payload.new) });
        } else if (payload.eventType === "DELETE") {
          onChange({ type: "DELETE", data: { id: payload.old.id } });
        }
      };

      const sub = supabase
        .channel("classes-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "classes" },
          handler
        )
        .subscribe();

      getClasses().then(({ data }) => {
        if (data) {
          onChange({ type: "INITIAL", data: toCamelCaseArray(data) });
        }
      });

      return () => {
        sub.unsubscribe();
      };
    },
    []
  );

  const subscribetoStudentChanges = useCallback(
    (classId, onChange) => {
      const handler = (payload) => {
        if (payload.eventType === "INSERT") {
          onChange({ type: "INSERT", data: toCamelCase(payload.new) });
        } else if (payload.eventType === "UPDATE") {
          onChange({ type: "UPDATE", data: toCamelCase(payload.new) });
        } else if (payload.eventType === "DELETE") {
          onChange({ type: "DELETE", data: { id: payload.old.id } });
        }
      };

      const sub = supabase
        .channel(`students-changes-${classId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "students",
            filter: `class_id=eq.${classId}`,
          },
          handler
        )
        .subscribe();

      getStudents(classId).then(({ data }) => {
        if (data) {
          onChange({ type: "INITIAL", data: toCamelCaseArray(data) });
        }
      });

      return () => {
        sub.unsubscribe();
      };
    },
    []
  );

  const subscribetoAttendanceChanges = useCallback(
    (classId, onChange) => {
      const handler = (payload) => {
        if (payload.eventType === "INSERT") {
          onChange({ type: "INSERT", data: toCamelCase(payload.new) });
        } else if (payload.eventType === "DELETE") {
          onChange({ type: "DELETE", data: { id: payload.old.id } });
        }
      };

      const sub = supabase
        .channel(`attendance-changes-${classId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "attendance_sessions",
            filter: `class_id=eq.${classId}`,
          },
          handler
        )
        .subscribe();

      getAttendanceSessions(classId).then(({ data }) => {
        if (data) {
          onChange({ type: "INITIAL", data: toCamelCaseArray(data) });
        }
      });

      return () => {
        sub.unsubscribe();
      };
    },
    []
  );

  const value = {
    MakeClass,
    getClassInfo,
    AddStudent,
    RecordAttendance,
    subscribetoAttendanceChanges,
    subscribetoClassesChanges,
    subscribetoStudentChanges,
  };

  return <dbContext.Provider value={value}>{children}</dbContext.Provider>;
}
