import React, { useState } from 'react';
import { AvailableSubject } from '../types';

interface BookingFormProps {
  onAddBooking: (studentName: string, phone: string, subjects: string[]) => void;
  availableSubjects: AvailableSubject[];
}

const BookingForm: React.FC<BookingFormProps> = ({ onAddBooking, availableSubjects }) => {
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!studentName.trim()) newErrors.studentName = 'اسم الطالب مطلوب.';
    if (!phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب.';
    } else if (!/^(\+201|01)[0125]\d{8}$/.test(phone)) {
      newErrors.phone = 'الرجاء إدخال رقم هاتف مصري صحيح (مثال: +201012345678 أو 01012345678).';
    }
    if (selectedSubjects.length === 0) {
      newErrors.subjects = 'يجب اختيار مادة واحدة على الأقل.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddBooking(studentName, phone, selectedSubjects);
      setStudentName('');
      setPhone('');
      setSelectedSubjects([]);
      setErrors({});
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">إنشاء حجز جديد</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          <div>
            <label htmlFor="studentName" className="block text-sm font-bold text-gray-700 mb-1">اسم الطالب</label>
            <input
              type="text"
              id="studentName"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className={`mt-1 block w-full px-4 py-3 bg-slate-50 border ${errors.studentName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
            />
            {errors.studentName && <p className="mt-1 text-xs text-red-600">{errors.studentName}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">رقم واتساب</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+201012345678"
              className={`mt-1 block w-full px-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700">اختر المواد</h3>
            {availableSubjects.length > 0 ? (
               <div className="mt-2 space-y-3 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-slate-50">
                {availableSubjects.map(subject => (
                  <div key={subject.name} className="flex items-center">
                    <input
                      id={subject.name}
                      name="subjects"
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.name)}
                      onChange={() => handleSubjectChange(subject.name)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor={subject.name} className="mr-3 block text-sm text-gray-900 cursor-pointer">{subject.name}</label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 text-center py-4 bg-slate-50 rounded-lg">الرجاء إضافة مواد دراسية أولاً من قسم "إدارة المواد".</p>
            )}
            
            {errors.subjects && <p className="mt-1 text-xs text-red-600">{errors.subjects}</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={availableSubjects.length === 0}
          className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          إرسال الحجز
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
