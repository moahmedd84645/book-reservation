import React, { useState, useEffect } from 'react';
import { Booking, AvailableSubject } from '../types';

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: (bookingId: string, studentName: string, phone: string, subjects: string[]) => void;
  availableSubjects: AvailableSubject[];
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose, onUpdate, availableSubjects }) => {
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setStudentName(booking.studentName);
    setPhone(booking.phone);
    setSelectedSubjects(booking.subjects.map(s => s.name));
  }, [booking]);

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
      newErrors.phone = 'الرجاء إدخال رقم هاتف مصري صحيح.';
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
      onUpdate(booking.id, studentName, phone, selectedSubjects);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl transform transition-all sm:max-w-2xl w-full">
        <form onSubmit={handleSubmit} noValidate>
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">تعديل الحجز</h2>
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
                    <div className="mt-2 space-y-3 max-h-40 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-slate-50">
                        {availableSubjects.map(subject => (
                        <div key={subject.id} className="flex items-center">
                            <input
                            id={`edit-${subject.id}`}
                            type="checkbox"
                            checked={selectedSubjects.includes(subject.name)}
                            onChange={() => handleSubjectChange(subject.name)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor={`edit-${subject.id}`} className="mr-3 block text-sm text-gray-900 cursor-pointer">{subject.name}</label>
                        </div>
                        ))}
                    </div>
                    {errors.subjects && <p className="mt-1 text-xs text-red-600">{errors.subjects}</p>}
                </div>
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 rounded-b-2xl">
                <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                >
                    حفظ التعديلات
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                    إلغاء
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
