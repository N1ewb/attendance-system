import { supabase } from "./supabase";

export async function getClasses() {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createClass(classData) {
  const { data, error } = await supabase
    .from("classes")
    .insert(classData)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getClass(id) {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateClass(id, classData) {
  const { data, error } = await supabase
    .from("classes")
    .update(classData)
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function deleteClass(id) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getStudents(classId) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function addStudent(classId, studentData) {
  const { data, error } = await supabase
    .from("students")
    .insert({ ...studentData, class_id: classId })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateStudent(classId, studentId, studentData) {
  const { data, error } = await supabase
    .from("students")
    .update(studentData)
    .eq("id", studentId)
    .eq("class_id", classId)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function deleteStudent(classId, studentId) {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("class_id", classId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getAttendanceSessions(classId) {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*")
    .eq("class_id", classId)
    .order("date", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createAttendanceSession(classId, sessionData) {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({ ...sessionData, class_id: classId })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getAttendanceRecords(sessionId) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*, students(*)")
    .eq("session_id", sessionId);
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createAttendanceRecord(sessionId, recordData) {
  const { data, error } = await supabase
    .from("attendance_records")
    .insert({ ...recordData, session_id: sessionId })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function uploadStudentImage(classId, studentId, file) {
  const ext = file.name.split(".").pop();
  const filePath = `${classId}/${studentId}_${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("student-images")
    .upload(filePath, file);
  if (uploadError) return { path: null, error: uploadError.message };
  return { path: filePath, error: null };
}

export async function getStudentImageUrl(filePath) {
  if (!filePath) return { url: null, error: null };
  const { data, error } = await supabase.storage
    .from("student-images")
    .createSignedUrl(filePath, 86400);
  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl, error: null };
}
