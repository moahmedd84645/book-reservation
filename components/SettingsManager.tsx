
import React from 'react';
import { toEasternArabicNumerals } from '../utils/numberConverter';

interface SettingsManagerProps {
  template: string;
  onTemplateChange: (newTemplate: string) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ template, onTemplateChange }) => {
  const placeholders = [
    { name: "{studentName}", description: "اسم الطالب" },
    { name: "{subjectList}", description: "قائمة المواد والأكواد" },
  ];

  const handlePlaceholderClick = (name: string) => {
    navigator.clipboard.writeText(name);
  };

  const dummyData = {
    studentName: "اسم الطالب الافتراضي",
    subjectList: `- حساب التفاضل والتكامل ١: ${toEasternArabicNumerals('CALC1-ABC123')}\n- مقدمة في الفيزياء: ${toEasternArabicNumerals('PHY101-XYZ789')}`
  };

  const previewMessage = template
    .replace('{studentName}', dummyData.studentName)
    .replace('{subjectList}', dummyData.subjectList);


  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">إعدادات رسالة واتساب</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label htmlFor="whatsapp-template" className="block text-sm font-bold text-gray-700">
            تعديل قالب الرسالة
          </label>
          <p className="text-xs text-gray-500 mb-2">
            انقر على العناصر لنسخها واستخدمها في القالب الخاص بك.
          </p>
           <div className="flex flex-wrap gap-2 mb-4">
            {placeholders.map(p => (
              <div 
                key={p.name} 
                className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handlePlaceholderClick(p.name)}
                title="انقر للنسخ"
              >
                <span className="font-mono font-bold text-blue-600">{p.name}</span>
                <span className="text-gray-600">- {p.description}</span>
              </div>
            ))}
          </div>
          <textarea
            id="whatsapp-template"
            rows={10}
            className="block w-full px-4 py-3 bg-slate-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">
            معاينة حية للرسالة
          </label>
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-slate-50 h-[280px]">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{previewMessage}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
