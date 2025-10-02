import React, { useState, useMemo, useRef } from 'react';
import { Booking } from '../types';
import { exportBookingsToExcel } from '../services/excelService';
import { ExcelIcon } from './icons/ExcelIcon';
import { ImportIcon } from './icons/ImportIcon';
import { SearchIcon } from './icons/SearchIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { toEasternArabicNumerals } from '../utils/numberConverter';

interface BookingListProps {
  bookings: Booking[];
  onImport: (file: File) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (bookingId: string) => void;
  onSendWhatsApp: (booking: Booking) => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onImport, onEdit, onDelete, onSendWhatsApp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking =>
      booking.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);
  
  const handleExport = () => {
    exportBookingsToExcel(bookings);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset file input to allow importing the same file again
      event.target.value = '';
    }
  };


  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          الحجوزات ({toEasternArabicNumerals(filteredBookings.length)})
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".xlsx, .xls"
          />
          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
          >
            <ImportIcon className="h-5 w-5" />
            استيراد
          </button>
          <button
            onClick={handleExport}
            disabled={bookings.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-gray-400"
          >
            <ExcelIcon className="h-5 w-5" />
            تصدير
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن اسم الطالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-slate-50 border border-gray-300 rounded-lg py-2 pl-10 pr-10 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">اسم الطالب</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">المواد المحجوزة</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">وقت الحجز</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{toEasternArabicNumerals(booking.subjects.length)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" dir="ltr" style={{textAlign: 'right'}}>
                      {toEasternArabicNumerals(booking.timestamp.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-2">
                         <button onClick={() => onSendWhatsApp(booking)} className="text-green-600 hover:text-green-900 transition-colors p-2 rounded-full hover:bg-green-100" title="إرسال عبر واتساب">
                          <WhatsAppIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => onEdit(booking)} className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-100" title="تعديل الحجز">
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => onDelete(booking.id)} className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-100" title="حذف الحجز">
                          <DeleteIcon className="h-5 w-5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-gray-900 break-all">{booking.studentName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{toEasternArabicNumerals(booking.subjects.length)} مواد</p>
                      </div>
                      <div className="flex items-center gap-1 -mr-2 flex-shrink-0">
                          <button onClick={() => onSendWhatsApp(booking)} className="text-green-600 hover:text-green-900 transition-colors p-2 rounded-full hover:bg-green-100" title="إرسال عبر واتساب">
                              <WhatsAppIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => onEdit(booking)} className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-100" title="تعديل الحجز">
                              <EditIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => onDelete(booking.id)} className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-100" title="حذف الحجز">
                              <DeleteIcon className="h-5 w-5"/>
                          </button>
                      </div>
                  </div>
                   <div className="mt-3 pt-3 border-t border-slate-200">
                       <p className="text-xs text-gray-500" dir="ltr" style={{textAlign: 'right'}}>
                          {toEasternArabicNumerals(booking.timestamp.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }))}
                       </p>
                   </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'لا توجد حجوزات تطابق بحثك' : 'لا توجد حجوزات بعد'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'جرب البحث بكلمة أخرى.' : 'قم بإنشاء حجز جديد أو استيراد ملف للبدء.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingList;
