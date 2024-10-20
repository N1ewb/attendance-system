import React from "react";
import { classes } from "../../lib/global";
import { Link } from "react-router-dom";

function ClassesCard({classes}) {
  return (
    <div className="w-full p-5 flex items-center justify-center gap-10">
      {classes.length != 0 ? classes.map((myclass) => (
        <div key={myclass.id} className="w-[30%] flex flex-col items-start gap-5 shadow-md rounded-3xl p-10">
          <p>{myclass.SubjectCode}</p>
          <p>{myclass.OfferNumber}</p>
          <p>{myclass.Description}</p>
          <Link to={`/private/class?id=${myclass.id}`}>Go to this class</Link>
        </div>
      )) : "You have no classes yet"}
    </div>
  );
}

export default ClassesCard;
