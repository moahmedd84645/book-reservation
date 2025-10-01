
import React, { useState } from 'react';
import { AvailableSubject } from '../types';
import { DeleteIcon } from './icons/DeleteIcon';

interface SubjectManagerProps {
  subjects: AvailableSubject[];
  onAddSubject: (name: string, prefix: string) => boolean;
  onDeleteSubject: (id: string) => void;
}

const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, onAddSubject, onDeleteSubject }) => {
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !prefix.trim()) {
      setError('يجب إدخال اسم ورمز المادة.');
      return;
    }
    const success = onAddSubject(name.trim(), prefix.trim().toUpperCase());
    if (success) {
      setName('');
      setPrefix('');
      setError('');
    } else {
      setError('اسم المادة أو رمزها مستخدم من قبل.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">إدارة المواد الدراسية</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="اسم المادة الجديد"
          value={name}
          onChange={e => setName(e.target.value)}
          className="md:col-span-1 block w-full px-4 py-3 bg-slate-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
        />
        <input
          type="text"
          placeholder="رمز المادة (مثال: MATH101)"
          value={prefix}
          onChange={e => setPrefix(e.target.value)}
          className="md:col-span-1 block w-full px-4 py-3 bg-slate-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
        />
        <button
          onClick={handleAdd}
          className="w-full md:col-span-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          إضافة مادة
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-4 text-center">{error}</p>}
      
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">المواد المتاحة حالياً ({subjects.length})</h3>
        {subjects.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">اسم المادة</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الرمز</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">إجراء</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 bg-slate-100 rounded-full text-center">{s.prefix}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => onDeleteSubject(s.id)} className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-100">
                      <DeleteIcon className="h-5 w-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-2 text-sm text-gray-500 text-center py-8">لا توجد مواد متاحة. أضف مادة جديدة لبدء الحجز.</p>
        )}
      </div>
    </div>
  );
};

export default SubjectManager;
