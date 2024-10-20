import React, { useState } from "react";
import { attendance } from "../../lib/global";
import { Link } from "react-router-dom";

function Attendance({id}) {
  const [openAttendance, setOpenAttendance] = useState(false);
  return (
    <div className="w-[60%] p-5">
      <header className="flex flex-row justify-between p-5">
        <h1 className="font-semibold text-[20px]">Attendance</h1>
        <Link to={`/private/attendance?id=${id}`}>Record Today Attendance</Link  >
      </header>
      <div className="attendance-container flex flex-col gap-5">
        {attendance.map((att, index) => (
          <div key={index} className=" shadow-md p-5  rounded-lg">
            {att.date}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Attendance;
