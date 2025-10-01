
import React from 'react';
import { Booking } from '../types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { toEasternArabicNumerals } from '../utils/numberConverter';

interface ConfirmationModalProps {
  booking: Booking;
  onClose: () => void;
  whatsAppTemplate: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ booking, onClose, whatsAppTemplate }) => {
  const createWhatsAppMessage = () => {
    const subjectListString = booking.subjects
      .map(subject => `- ${subject.name}: ${subject.code}`) // Send original English code
      .join('\n');
    
    const message = whatsAppTemplate
      .replace('{studentName}', booking.studentName)
      .replace('{subjectList}', subjectListString);
      
    return encodeURIComponent(message);
  };

  const handleSendWhatsApp = () => {
    // Ensure phone number starts with country code for WhatsApp link
    let phoneNumber = booking.phone.replace(/\D/g, ''); // Remove non-numeric characters
    if (phoneNumber.startsWith('01')) {
      phoneNumber = '2' + phoneNumber; // Prepend '2' for Egypt country code
    }

    const message = createWhatsAppMessage();
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">تم الحجز بنجاح!</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  تأكيد حجز لـ <strong className="font-semibold">{booking.studentName}</strong>.
                </p>
                <div className="mt-3 max-h-48 overflow-y-auto pr-2">
                  <p className="text-sm text-gray-800 font-medium">أكواد الحجز الخاصة بك هي:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-600">
                    {booking.subjects.map(subject => (
                      <li key={subject.code}>
                        {subject.name}: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{toEasternArabicNumerals(subject.code)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
          >
            <WhatsAppIcon className="h-5 w-5 ml-2" />
            إرسال عبر واتساب
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
