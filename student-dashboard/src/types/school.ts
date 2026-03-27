export interface Student {
  id: string;
  name: string;
  yearOfStudy: string;
  section: string;
  fatherName: string;
  motherName: string;
  hostelOrDayScholar: 'Hostel' | 'Day Scholar';
  homeAddress: string;
  primaryContact: string;
  secondaryContact: string;
  dateOfBirth: string;
  aadhaarNumber: string;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  status: 'Paid' | 'Pending';
  dueDate: string;
}

export interface Attendance {
  id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface Assignment {
  id: string;
  type: 'classwork' | 'homework';
  subject: string;
  date: string;
  description: string;
  status: 'Completed' | 'Pending';
}

export interface TestMark {
  id: string;
  testName: string;
  subject: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
}

export interface TeacherSchedule {
  id: string;
  day: string;
  periods: {
    time: string;
    subject: string;
    class: string;
  }[];
}
