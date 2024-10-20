export const classes = [
    {
        id: 1233,
        subjectCode: 'IT Prof El4',
        offerNumber: '83583',
        description: 'IT Professional Elective 4',
        units: '3',
    },  
    {
        id: 1234,
        subjectCode: 'IT Prof El3',
        offerNumber: '83582',
        description: 'IT Professional Elective 3',
        units: '3',
    },  
    {
        id: 1235,
        subjectCode: 'IT Elect 2',
        offerNumber: '83584',
        description: 'IT Elective 2',
        units: '3',
    },  
]

export const students = [
    {
      course: "BSIT",
      firstname: "John",
      lastname: "Doe",
      last_attendance_time: "2024-10-20T14:00:00Z",
      total_attendance: 10,
      year: 2
    },
    {
      course: "BSCS",
      firstname: "Jane",
      lastname: "Smith",
      last_attendance_time: "2024-10-19T09:30:00Z",
      total_attendance: 8,
      year: 1
    },
    {
      course: "BSIT",
      firstname: "Alice",
      lastname: "Johnson",
      last_attendance_time: "2024-10-18T10:15:00Z",
      total_attendance: 5,
      year: 3
    },
    {
      course: "BSCS",
      firstname: "Michael",
      lastname: "Brown",
      last_attendance_time: "2024-10-17T11:45:00Z",
      total_attendance: 7,
      year: 2
    },
    {
      course: "BSIT",
      firstname: "Emily",
      lastname: "Davis",
      last_attendance_time: "2024-10-16T08:00:00Z",
      total_attendance: 9,
      year: 1
    }
  ];
  

  export const attendance = [
    {
      date: "2024-10-01",
      studentPresent: [
        {
          firstname: "John",
          lastname: "Doe",
          course: "BSIT",
          status: "present"
        },
        {
          firstname: "Jane",
          lastname: "Smith",
          course: "BSCS",
          status: "present"
        }
      ]
    },
    {
      date: "2024-10-02",
      studentPresent: [
        {
          firstname: "Alice",
          lastname: "Johnson",
          course: "BSIT",
          status: "present"
        },
        {
          firstname: "Michael",
          lastname: "Brown",
          course: "BSCS",
          status: "present"
        }
      ]
    },
    {
      date: "2024-10-03",
      studentPresent: [
        {
          firstname: "Emily",
          lastname: "Davis",
          course: "BSIT",
          status: "present"
        },
        {
          firstname: "Chris",
          lastname: "Wilson",
          course: "BSCS",
          status: "present"
        }
      ]
    }
  ];
  