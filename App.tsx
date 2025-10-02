import React, { useState, useEffect } from 'react';
import { Booking, AvailableSubject } from './types';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import ConfirmationModal from './components/ConfirmationModal';
import SubjectManager from './components/SubjectManager';
import SettingsManager from './components/SettingsManager';
import Sidebar from './components/Sidebar';
import EditBookingModal from './components/EditBookingModal';
import { importBookingsFromExcel } from './services/excelService';
import { MenuIcon } from './components/icons/MenuIcon';

type View = 'form' | 'list' | 'subjects' | 'settings';

const App: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((b: any) => ({ ...b, timestamp: new Date(b.timestamp) }));
      }
    } catch (e) {
      console.error("Failed to load bookings from localStorage", e);
    }
    return [];
  });

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [activeView, setActiveView] = useState<View>('form');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>(() => {
    const saved = localStorage.getItem('availableSubjects');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return []; // Corrupted data
      }
    }
    // First time load, provide defaults
    return [
      { id: "1", name: "حساب التفاضل والتكامل ١", prefix: "CALC1" },
      { id: "2", name: "مقدمة في الفيزياء", prefix: "PHY101" },
      { id: "3", name: "الكيمياء العضوية", prefix: "CHEM2" },
    ];
  });

  const [whatsAppTemplate, setWhatsAppTemplate] = useState<string>(() => {
    const saved = localStorage.getItem('whatsAppTemplate');
    return saved || 'مرحباً {studentName}،\n\nتم تأكيد حجز كتبك بنجاح!\n\nإليك أكواد الحجز الخاصة بك:\n{subjectList}\n\nالرجاء إبراز هذه الأكواد عند استلام كتبك.';
  });
  
  const [sequenceCounters, setSequenceCounters] = useState<{ [prefix: string]: number }>(() => {
    const saved = localStorage.getItem('sequenceCounters');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return {};
        }
    }
    return {};
  });

  // Effect to save data to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (e) {
        console.error("Failed to save bookings to localStorage", e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
        localStorage.setItem('availableSubjects', JSON.stringify(availableSubjects));
    } catch (e) {
        console.error("Failed to save subjects to localStorage", e);
    }
  }, [availableSubjects]);

  useEffect(() => {
    try {
        localStorage.setItem('whatsAppTemplate', whatsAppTemplate);
    } catch (e) {
        console.error("Failed to save template to localStorage", e);
    }
  }, [whatsAppTemplate]);

  useEffect(() => {
    try {
        localStorage.setItem('sequenceCounters', JSON.stringify(sequenceCounters));
    } catch (e) {
        console.error("Failed to save counters to localStorage", e);
    }
  }, [sequenceCounters]);


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
  
  const normalizePhone = (p: string) => {
    let digits = p.replace(/\D/g, '');
    if (digits.startsWith('01')) {
        return '2' + digits;
    }
    return digits; // covers '201...' and other formats
  }

  const handleAddBooking = (studentName: string, phone: string, selectedSubjectNames: string[]) => {
    const normalizedNewPhone = normalizePhone(phone);
    const isDuplicate = bookings.some(b => 
        b.studentName.trim().toLowerCase() === studentName.trim().toLowerCase() &&
        normalizePhone(b.phone) === normalizedNewPhone
    );

    if (isDuplicate) {
        alert('هذا الطالب مسجل بالفعل بنفس الاسم ورقم الهاتف.');
        return;
    }
    
    const updatedCounters = { ...sequenceCounters };

    const subjectsWithCodes = selectedSubjectNames.map(subjectName => {
      const subjectPrefix = availableSubjects.find(s => s.name === subjectName)?.prefix || 'SUB';
      const nextId = (updatedCounters[subjectPrefix] || 0) + 1;
      updatedCounters[subjectPrefix] = nextId;
      const code = `${subjectPrefix}-${String(nextId).padStart(3, '0')}`;
      return {
        name: subjectName,
        code: code,
      };
    });

    const newBooking: Booking = {
      id: `${Date.now()}-${studentName}`,
      studentName,
      phone,
      subjects: subjectsWithCodes,
      timestamp: new Date(),
    };

    setSequenceCounters(updatedCounters);
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
      
      const updatedCounters = { ...sequenceCounters };

      Object.values(groupedByNameAndPhone).forEach((data, index) => {
        const newBooking: Booking = {
          id: `${Date.now()}-${data.studentName}-${index}`,
          studentName: data.studentName,
          phone: data.phone,
          subjects: data.subjects.map(subjectName => {
            const subjectPrefix = availableSubjects.find(s => s.name === subjectName)?.prefix || 'SUB';
            const nextId = (updatedCounters[subjectPrefix] || 0) + 1;
            updatedCounters[subjectPrefix] = nextId;
            const code = `${subjectPrefix}-${String(nextId).padStart(3, '0')}`;
            return {
              name: subjectName,
              code: code,
            };
          }),
          timestamp: new Date(),
        };
        newBookings.push(newBooking);
      });
  
      setSequenceCounters(updatedCounters);
      setBookings(prev => [...newBookings, ...prev]);
      alert(`تم استيراد ${newBookings.length} حجز جديد بنجاح.`);
  
    } catch (error) {
      console.error("Error importing file:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء استيراد الملف. تأكد من أن الأعمدة مطابقة للنموذج المطلوب.";
      alert(message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveBooking(null);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  const handleStartEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBooking(null);
  };
  
  const handleUpdateBooking = (bookingId: string, studentName: string, phone: string, selectedSubjectNames: string[]) => {
    const originalBooking = bookings.find(b => b.id === bookingId);
    if (!originalBooking) return;

    const updatedCounters = { ...sequenceCounters };

    const newSubjectsWithCodes = selectedSubjectNames.map(subjectName => {
      const existingSubject = originalBooking.subjects.find(s => s.name === subjectName);
      if (existingSubject) {
        return existingSubject; 
      } else {
        const subjectPrefix = availableSubjects.find(s => s.name === subjectName)?.prefix || 'SUB';
        const nextId = (updatedCounters[subjectPrefix] || 0) + 1;
        updatedCounters[subjectPrefix] = nextId;
        const code = `${subjectPrefix}-${String(nextId).padStart(3, '0')}`;
        return { name: subjectName, code: code };
      }
    });
    
    const updatedBooking: Booking = {
      ...originalBooking,
      studentName,
      phone,
      subjects: newSubjectsWithCodes,
    };

    setSequenceCounters(updatedCounters);
    setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
    handleCloseEditModal();
  };
  
  const handleResendWhatsApp = (booking: Booking) => {
    const subjectListString = booking.subjects
      .map(subject => `- ${subject.name}: ${subject.code}`)
      .join('\n');
    
    const message = whatsAppTemplate
      .replace('{studentName}', booking.studentName)
      .replace('{subjectList}', subjectListString);
      
    const encodedMessage = encodeURIComponent(message);

    let phoneNumber = booking.phone.replace(/\D/g, '');
    if (phoneNumber.startsWith('01')) {
      phoneNumber = '2' + phoneNumber;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'form':
        return <BookingForm onAddBooking={handleAddBooking} availableSubjects={availableSubjects} />;
      case 'list':
        return <BookingList bookings={bookings} availableSubjects={availableSubjects} onImport={handleImportBookings} onEdit={handleStartEdit} onDelete={handleDeleteBooking} onSendWhatsApp={handleResendWhatsApp} />;
      case 'subjects':
        return <SubjectManager subjects={availableSubjects} onAddSubject={handleAddSubject} onDeleteSubject={handleDeleteSubject} />;
      case 'settings':
        return <SettingsManager template={whatsAppTemplate} onTemplateChange={setWhatsAppTemplate} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen md:flex bg-slate-100 font-sans text-gray-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsSidebarOpen(false)} />}


      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              نظام حجز الكتب
            </h1>
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6">
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

      {isEditModalOpen && editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateBooking}
          availableSubjects={availableSubjects}
        />
      )}
    </div>
  );
};

export default App;