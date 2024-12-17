import React from "react";
import { useModal } from "../../context/ModalContext";

export default function StudentsModal() {
  const { currentStudent, handleToggleStudentModal } = useModal();

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
          <img
            src={currentStudent.studentImage}
            alt="student-id"
            className="max-h-[250px] max-w-[250px] object-cover rounded-full border-4 border-green-500 shadow-lg"
          />
        </div>

        <div className="student-deets flex flex-col gap-5">
          <p className="text-lg font-semibold text-gray-800">
            Full Name:
            <span className="font-normal text-green-600">
              {currentStudent.firstName} {currentStudent.lastName}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Student ID Number:
            <span className="font-normal text-gray-600">
              {currentStudent.studentID}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Email:
            <span className="font-normal text-gray-600">
              {currentStudent.email}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Course:
            <span className="font-normal text-green-600">
              {currentStudent.course}
            </span>
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Department:
            <span className="font-normal text-gray-600">
              {currentStudent.department}
            </span>
          </p>
        </div>
        
        <div className="flex justify-end mt-4">
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
