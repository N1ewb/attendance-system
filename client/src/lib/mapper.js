const COLUMN_MAP = {
  user_id: "userId",
  subject_code: "subjectCode",
  offer_number: "offerNumber",
  units: "units",
  created_at: "createdAt",
  class_id: "classId",
  first_name: "firstName",
  last_name: "lastName",
  student_id: "studentId",
  image_url: "imageUrl",
  face_encoding: "faceEncoding",
  total_attendance: "totalAttendance",
  last_attendance_time: "lastAttendanceTime",
  session_id: "sessionId",
  session_name: "sessionName",
  time_in: "timeIn",
  avatar_url: "avatarUrl",
  is_online: "isOnline",
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(COLUMN_MAP).map(([k, v]) => [v, k])
);

export function toCamelCase(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return record;
  const result = {};
  for (const key of Object.keys(record)) {
    const mapped = COLUMN_MAP[key] || key;
    result[mapped] = record[key];
  }
  return result;
}

export function toSnakeCase(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return record;
  const result = {};
  for (const key of Object.keys(record)) {
    const mapped = REVERSE_MAP[key] || key;
    result[mapped] = record[key];
  }
  return result;
}

export function toCamelCaseArray(records) {
  if (!Array.isArray(records)) return records;
  return records.map(toCamelCase);
}
