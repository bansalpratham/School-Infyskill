import { Student, Fee, Attendance, Assignment, TestMark, TeacherSchedule } from '@/types/school';

export const dummyStudent: Student = {
  id: '1',
  name: 'Rahul Kumar',
  yearOfStudy: '10th Grade',
  section: 'A',
  fatherName: 'Suresh Kumar',
  motherName: 'Anita Kumar',
  hostelOrDayScholar: 'Day Scholar',
  homeAddress: '123 Main Street, Bangalore, Karnataka 560001',
  primaryContact: '+91 98765 43210',
  secondaryContact: '+91 87654 32109',
  dateOfBirth: '2010-05-15',
  aadhaarNumber: '1234 5678 9012',
};

export const dummyFees: Fee[] = [
  { id: '1', name: 'Semester Fee', amount: 25000, status: 'Paid', dueDate: '2024-01-15' },
  { id: '2', name: 'Monthly Fee', amount: 3500, status: 'Paid', dueDate: '2024-01-05' },
  { id: '3', name: 'Bus Fee', amount: 1500, status: 'Pending', dueDate: '2024-01-10' },
  { id: '4', name: 'Hostel Fee', amount: 0, status: 'Paid', dueDate: '' },
  { id: '5', name: 'Lab Fee', amount: 2000, status: 'Pending', dueDate: '2024-01-20' },
];

export const dummyAttendance: Attendance[] = [
  { id: '1', date: '2024-01-15', status: 'Present' },
  { id: '2', date: '2024-01-14', status: 'Present' },
  { id: '3', date: '2024-01-13', status: 'Absent' },
  { id: '4', date: '2024-01-12', status: 'Present' },
  { id: '5', date: '2024-01-11', status: 'Present' },
  { id: '6', date: '2024-01-10', status: 'Present' },
  { id: '7', date: '2024-01-09', status: 'Absent' },
  { id: '8', date: '2024-01-08', status: 'Present' },
  { id: '9', date: '2024-01-07', status: 'Present' },
  { id: '10', date: '2024-01-06', status: 'Present' },
];

export const dummyClasswork: Assignment[] = [
  { id: '1', type: 'classwork', subject: 'Mathematics', date: '2024-01-15', description: 'Complete exercises 5.1 to 5.5 from textbook', status: 'Completed' },
  { id: '2', type: 'classwork', subject: 'Science', date: '2024-01-15', description: 'Lab experiment on chemical reactions', status: 'Completed' },
  { id: '3', type: 'classwork', subject: 'English', date: '2024-01-14', description: 'Essay writing on Environmental Conservation', status: 'Pending' },
  { id: '4', type: 'classwork', subject: 'Social Studies', date: '2024-01-14', description: 'Map work - Indian States and Capitals', status: 'Completed' },
];

export const dummyHomework: Assignment[] = [
  { id: '1', type: 'homework', subject: 'Mathematics', date: '2024-01-15', description: 'Solve practice problems from Chapter 6', status: 'Pending' },
  { id: '2', type: 'homework', subject: 'Science', date: '2024-01-15', description: 'Write lab report for chemical reactions experiment', status: 'Pending' },
  { id: '3', type: 'homework', subject: 'Hindi', date: '2024-01-14', description: 'Learn poem for recitation', status: 'Completed' },
  { id: '4', type: 'homework', subject: 'Computer Science', date: '2024-01-13', description: 'Create a simple HTML webpage', status: 'Completed' },
];

export const dummyMarks: TestMark[] = [
  { id: '1', testName: 'Test 1', subject: 'Mathematics', totalMarks: 100, marksObtained: 85, percentage: 85 },
  { id: '2', testName: 'Test 1', subject: 'Science', totalMarks: 100, marksObtained: 78, percentage: 78 },
  { id: '3', testName: 'Test 1', subject: 'English', totalMarks: 100, marksObtained: 92, percentage: 92 },
  { id: '4', testName: 'Test 2', subject: 'Mathematics', totalMarks: 50, marksObtained: 42, percentage: 84 },
  { id: '5', testName: 'Test 2', subject: 'Science', totalMarks: 50, marksObtained: 38, percentage: 76 },
  { id: '6', testName: 'Test 2', subject: 'English', totalMarks: 50, marksObtained: 45, percentage: 90 },
  { id: '7', testName: 'Test 3', subject: 'Hindi', totalMarks: 100, marksObtained: 75, percentage: 75 },
  { id: '8', testName: 'Test 3', subject: 'Social Studies', totalMarks: 100, marksObtained: 88, percentage: 88 },
];

export const dummyTeacherSchedule: TeacherSchedule[] = [
  {
    id: '1',
    day: 'Monday',
    periods: [
      { time: '8:00 - 8:45', subject: 'Mathematics', class: '10-A' },
      { time: '8:45 - 9:30', subject: 'Mathematics', class: '10-B' },
      { time: '9:45 - 10:30', subject: 'Mathematics', class: '9-A' },
      { time: '10:30 - 11:15', subject: 'Free Period', class: '-' },
      { time: '11:30 - 12:15', subject: 'Mathematics', class: '8-A' },
      { time: '12:15 - 1:00', subject: 'Mathematics', class: '8-B' },
    ],
  },
  {
    id: '2',
    day: 'Tuesday',
    periods: [
      { time: '8:00 - 8:45', subject: 'Mathematics', class: '9-B' },
      { time: '8:45 - 9:30', subject: 'Mathematics', class: '10-A' },
      { time: '9:45 - 10:30', subject: 'Free Period', class: '-' },
      { time: '10:30 - 11:15', subject: 'Mathematics', class: '10-B' },
      { time: '11:30 - 12:15', subject: 'Mathematics', class: '9-A' },
      { time: '12:15 - 1:00', subject: 'Mathematics', class: '8-A' },
    ],
  },
  {
    id: '3',
    day: 'Wednesday',
    periods: [
      { time: '8:00 - 8:45', subject: 'Mathematics', class: '8-B' },
      { time: '8:45 - 9:30', subject: 'Mathematics', class: '9-A' },
      { time: '9:45 - 10:30', subject: 'Mathematics', class: '9-B' },
      { time: '10:30 - 11:15', subject: 'Mathematics', class: '10-A' },
      { time: '11:30 - 12:15', subject: 'Free Period', class: '-' },
      { time: '12:15 - 1:00', subject: 'Mathematics', class: '10-B' },
    ],
  },
  {
    id: '4',
    day: 'Thursday',
    periods: [
      { time: '8:00 - 8:45', subject: 'Mathematics', class: '10-B' },
      { time: '8:45 - 9:30', subject: 'Free Period', class: '-' },
      { time: '9:45 - 10:30', subject: 'Mathematics', class: '8-A' },
      { time: '10:30 - 11:15', subject: 'Mathematics', class: '8-B' },
      { time: '11:30 - 12:15', subject: 'Mathematics', class: '9-B' },
      { time: '12:15 - 1:00', subject: 'Mathematics', class: '10-A' },
    ],
  },
  {
    id: '5',
    day: 'Friday',
    periods: [
      { time: '8:00 - 8:45', subject: 'Mathematics', class: '9-A' },
      { time: '8:45 - 9:30', subject: 'Mathematics', class: '9-B' },
      { time: '9:45 - 10:30', subject: 'Mathematics', class: '10-A' },
      { time: '10:30 - 11:15', subject: 'Mathematics', class: '10-B' },
      { time: '11:30 - 12:15', subject: 'Mathematics', class: '8-A' },
      { time: '12:15 - 1:00', subject: 'Free Period', class: '-' },
    ],
  },
];

export const subjects = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Studies',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'Sanskrit',
];

export const tests = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'];
