
import { Booking } from '../types';

declare const XLSX: any;

interface ExcelRow {
  'اسم الطالب': string;
  'رقم الهاتف': string | number;
  'المادة المحجوزة': string;
}


export const exportBookingsToExcel = (bookings: Booking[]): void => {
  if (typeof XLSX === 'undefined') {
    console.error("XLSX library is not loaded.");
    alert("وظيفة تصدير Excel غير متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا.");
    return;
  }

  const flattenedData = bookings.flatMap(booking => 
    booking.subjects.map(subject => ({
      'اسم الطالب': booking.studentName,
      'رقم الهاتف': booking.phone,
      'المادة المحجوزة': subject.name,
      'كود الحجز': subject.code,
      'وقت الحجز': booking.timestamp.toISOString(),
    }))
  );

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);

  worksheet['!cols'] = [
    { wch: 25 }, // Student Name
    { wch: 20 }, // Phone Number
    { wch: 30 }, // Booked Subject
    { wch: 25 }, // Booking Code
    { wch: 25 }, // Booking Timestamp
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الحجوزات');
  
  XLSX.writeFile(workbook, 'حجوزات_الكتب.xlsx');
};


export const importBookingsFromExcel = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined' || typeof FileReader === 'undefined') {
      return reject(new Error("XLSX library or FileReader is not available."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
        
        // Basic validation
        if (json.length > 0) {
            const firstRow = json[0];
            if (!firstRow['اسم الطالب'] || !firstRow['رقم الهاتف'] || !firstRow['المادة المحجوزة']) {
                throw new Error("الملف المستورد يفتقد لأحد الأعمدة المطلوبة: 'اسم الطالب', 'رقم الهاتف', 'المادة المحجوزة'.");
            }
        }
        
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
