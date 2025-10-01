
import React, { useState } from 'react';
import { Booking, AvailableSubject } from './types';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import ConfirmationModal from './components/ConfirmationModal';
import SubjectManager from './components/SubjectManager';
import SettingsManager from './components/SettingsManager';
import Sidebar from './components/Sidebar';
import { generateBookingCode } from './utils/codeGenerator';
import { importBookingsFromExcel } from './services/excelService';

type View = 'form' | 'list' | 'subjects' | 'settings';

const App: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('form');
  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([
    { id: "1", name: "حساب التفاضل والتكامل ١", prefix: "CALC1" },
    { id: "2", name: "مقدمة في الفيزياء", prefix: "PHY101" },
    { id: "3", name: "الكيمياء العضوية", prefix: "CHEM2" },
  ]);
  const [whatsAppTemplate, setWhatsAppTemplate] = useState<string>(
    'مرحباً {studentName}،\n\nتم تأكيد حجز كتبك بنجاح!\n\nإليك أكواد الحجز الخاصة بك:\n{subjectList}\n\nالرجاء إبراز هذه الأكواد عند استلام كتبك.'
  );

  const handleAddSubject = (name: string, prefix: string) => {
    if (name && prefix && !availableSubjects.some(s => s.name === name || s.prefix === prefix)) {
      const newSubject = { id: Date.now().toString(), name, prefix };
      setAvailableSubjects(prev => [...prev, newSubject]);
      return true;
    }
    return false;
  };

  const handleDeleteSubject = (id: string) => {
    setAvailableSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleAddBooking = (studentName: string, phone: string, selectedSubjectNames: string[]) => {
    const newBooking: Booking = {
      studentName,
      phone,
      subjects: selectedSubjectNames.map(subjectName => {
        const subjectPrefix = availableSubjects.find(s => s.name === subjectName)?.prefix || 'SUB';
        return {
          name: subjectName,
          code: generateBookingCode(subjectPrefix),
        };
      }),
      timestamp: new Date(),
    };
    setBookings(prevBookings => [newBooking, ...prevBookings]);
    setActiveBooking(newBooking);
    setIsModalOpen(true);
  };
  
  const handleImportBookings = async (file: File) => {
    try {
      const importedData = await importBookingsFromExcel(file);
      const newBookings: Booking[] = [];
      const groupedByNameAndPhone: { [key: string]: { studentName: string, phone: string, subjects: string[] } } = {};
  
      for (const item of importedData) {
        const subjectExists = availableSubjects.some(s => s.name === item['المادة المحجوزة']);
        if (!subjectExists) {
          alert(`المادة "${item['المادة المحجوزة']}" غير موجودة في قائمة المواد المتاحة. سيتم تجاهلها.`);
          continue;
        }
  
        const key = `${item['اسم الطالب']}-${item['رقم الهاتف']}`;
        if (!groupedByNameAndPhone[key]) {
          groupedByNameAndPhone[key] = { studentName: item['اسم الطالب'], phone: String(item['رقم الهاتف']), subjects: [] };
        }
        groupedByNameAndPhone[key].subjects.push(item['المادة المحجوزة']);
      }
  
      for (const key in groupedByNameAndPhone) {
        const data = groupedByNameAndPhone[key];
        const newBooking: Booking = {
          studentName: data.studentName,
          phone: data.phone,
          subjects: data.subjects.map(subjectName => {
            const subjectPrefix = availableSubjects.find(s => s.name === subjectName)?.prefix || 'SUB';
            return {
              name: subjectName,
              code: generateBookingCode(subjectPrefix),
            };
          }),
          timestamp: new Date(),
        };
        newBookings.push(newBooking);
      }
  
      setBookings(prev => [...newBookings, ...prev]);
      alert(`تم استيراد ${newBookings.length} حجز جديد بنجاح.`);
  
    } catch (error) {
      console.error("Error importing file:", error);
      alert("حدث خطأ أثناء استيراد الملف. تأكد من أن الأعمدة مطابقة للنموذج المطلوب: اسم الطالب، رقم الهاتف، المادة المحجوزة.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveBooking(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'form':
        return <BookingForm onAddBooking={handleAddBooking} availableSubjects={availableSubjects} />;
      case 'list':
        return <BookingList bookings={bookings} onImport={handleImportBookings} />;
      case 'subjects':
        return <SubjectManager subjects={availableSubjects} onAddSubject={handleAddSubject} onDeleteSubject={handleDeleteSubject} />;
      case 'settings':
        return <SettingsManager template={whatsAppTemplate} onTemplateChange={setWhatsAppTemplate} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-gray-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800">
              نظام حجز الكتب الجامعي
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
          <div className="container mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {isModalOpen && activeBooking && (
        <ConfirmationModal
          booking={activeBooking}
          onClose={handleCloseModal}
          whatsAppTemplate={whatsAppTemplate}
        />
      )}
    </div>
  );
};

export default App;
