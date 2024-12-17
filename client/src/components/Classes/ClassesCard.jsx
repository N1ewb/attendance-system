import React from "react";
import { useNavigate } from "react-router-dom";

function ClassesCard({ classes }) {
  const navigate = useNavigate();
  return (
    <div className="w-full p-5 flex flex-wrap gap-10 justify-start">
      {classes.length !== 0 ? (
        classes.map((myclass) => (
          <div
            onClick={() => navigate(`/private/class?id=${myclass.id}`)}
            key={myclass.id}
            className="w-full sm:w-[48%] lg:w-[30%] flex flex-col items-start gap-5 shadow-md cursor-pointer rounded-xl bg-white p-6 border border-gray-200 hover:shadow-2xl transition-shadow"
          >
            <p className="text-lg font-semibold text-gray-700">
              {myclass.SubjectCode}
            </p>
            <p className="text-sm text-gray-600">
              Subject Code: <span>{myclass.OfferNumber}</span>
            </p>
            <p className="text-sm text-gray-600">{myclass.Description}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-600">You have no classes yet</p>
      )}
    </div>
  );
}

export default ClassesCard;
