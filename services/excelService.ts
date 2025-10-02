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
        
        // Use {header: 1} to get an array of arrays, which is more reliable for header validation.
        const dataAsArrays: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (dataAsArrays.length < 1) {
          // Handle empty sheets
          return resolve([]);
        }

        const headers: string[] = (dataAsArrays[0] as any[]).map(h => String(h || '').trim());
        const requiredHeaders = ['اسم الطالب', 'رقم الهاتف', 'المادة المحجوزة'];

        // Validate that all required headers are present.
        for (const requiredHeader of requiredHeaders) {
          if (!headers.includes(requiredHeader)) {
            const friendlyMessage = `الملف المستورد يفتقد للعمود المطلوب: '${requiredHeader}'. الأعمدة المطلوبة هي: 'اسم الطالب', 'رقم الهاتف', 'المادة المحجوزة'.`;
            throw new Error(friendlyMessage);
          }
        }

        // Convert the remaining rows into an array of objects.
        const dataRows = dataAsArrays.slice(1);
        const json: ExcelRow[] = dataRows
          .map(rowArray => {
            const rowObject: { [key: string]: any } = {};
            headers.forEach((header, index) => {
              if (header) { // Only add properties for non-empty headers
                rowObject[header] = rowArray[index];
              }
            });
            return rowObject as ExcelRow;
          })
          .filter(row => {
            // Filter out rows where all required fields are empty/null.
            return requiredHeaders.some(header => row[header] != null && String(row[header]).trim() !== '');
          });
        
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
