
export interface Subject {
  name: string;
  code: string;
}

export interface AvailableSubject {
  id: string;
  name: string;
  prefix: string;
}

export interface Booking {
  studentName: string;
  phone: string;
  subjects: Subject[];
  timestamp: Date;
}
