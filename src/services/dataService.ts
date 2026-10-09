import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Clinic, Doctor, Appointment, SupportTicket } from '../types';
import { 
  INITIAL_CLINICS, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_SUPPORT_TICKETS 
} from '../data/seedData';

const LOCAL_STORAGE_KEY_CLINICS = 'mdd_clinics_cache';
const LOCAL_STORAGE_KEY_DOCTORS = 'mdd_doctors_cache';
const LOCAL_STORAGE_KEY_APPOINTMENTS = 'mdd_appointments_cache';
const LOCAL_STORAGE_KEY_TICKETS = 'mdd_tickets_cache';

// Helper to normalize appointment numbers into valid 4-digit OTP numbers (1000 - 9999)
export function normalizeAppointmentNumbers(apts: Appointment[]): Appointment[] {
  if (!apts || apts.length === 0) return [];
  
  // Group by doctorId and date
  const groups: { [key: string]: Appointment[] } = {};
  for (const apt of apts) {
    const key = `${apt.doctorId || 'doc'}_${apt.date || 'today'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(apt);
  }

  const result: Appointment[] = [];
  for (const key of Object.keys(groups)) {
    const group = groups[key];
    // Sort by timeSlot then createdAt
    group.sort((a, b) => {
      if (a.timeSlot && b.timeSlot && a.timeSlot !== b.timeSlot) {
        return a.timeSlot.localeCompare(b.timeSlot);
      }
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    let seq = 1;
    for (const apt of group) {
      const trimmed = (apt.appointmentNumber || '').trim();
      // Valid 4-digit numeric OTP (1000 - 9999)
      const is4DigitNumeric = /^\d{4}$/.test(trimmed);
      if (is4DigitNumeric) {
        const qrPayload = apt.qrCodeData || `MYDEHRIDOC:${trimmed}:${apt.clinicId}:${apt.doctorId}:${apt.date}`;
        result.push({
          ...apt,
          appointmentNumber: trimmed,
          qrCodeData: qrPayload
        });
      } else {
        // Legacy single digit or MDD- prefix: convert to stable 4-digit OTP
        const newOtp = String(8000 + (seq % 1000));
        result.push({
          ...apt,
          appointmentNumber: newOtp,
          qrCodeData: `MYDEHRIDOC:${newOtp}:${apt.clinicId}:${apt.doctorId}:${apt.date}`
        });
      }
      seq++;
    }
  }

  return result;
}

class DataService {
  private static instance: DataService;
  private isInitialized = false;
  private appointmentListeners: ((appointments: Appointment[]) => void)[] = [];

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private notifyAppointmentListeners(apts: Appointment[]) {
    const normalized = normalizeAppointmentNumbers(apts);
    for (const listener of this.appointmentListeners) {
      try {
        listener(normalized);
      } catch (err) {
        console.warn("Appointment listener notification warning:", err);
      }
    }
  }

  // Initialize and seed database if empty
  public async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check clinics
      const clinicsCol = collection(db, 'clinics');
      const clinicSnapshot = await getDocs(clinicsCol);
      if (clinicSnapshot.empty) {
        console.log("Seeding initial clinics to Firestore...");
        for (const clinic of INITIAL_CLINICS) {
          await setDoc(doc(db, 'clinics', clinic.id), clinic);
        }
      }

      // Check doctors
      const doctorsCol = collection(db, 'doctors');
      const doctorSnapshot = await getDocs(doctorsCol);
      if (doctorSnapshot.empty) {
        console.log("Seeding initial doctors to Firestore...");
        for (const doctor of INITIAL_DOCTORS) {
          await setDoc(doc(db, 'doctors', doctor.id), doctor);
        }
      }

      // Check appointments
      const appointmentsCol = collection(db, 'appointments');
      const aptSnapshot = await getDocs(appointmentsCol);
      if (aptSnapshot.empty) {
        console.log("Seeding sample appointments to Firestore...");
        for (const apt of INITIAL_APPOINTMENTS) {
          await setDoc(doc(db, 'appointments', apt.id), apt);
        }
      }

      // Check support tickets
      const ticketsCol = collection(db, 'supportTickets');
      const tktSnapshot = await getDocs(ticketsCol);
      if (tktSnapshot.empty) {
        console.log("Seeding sample support tickets to Firestore...");
        for (const tkt of INITIAL_SUPPORT_TICKETS) {
          await setDoc(doc(db, 'supportTickets', tkt.id), tkt);
        }
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn("Firestore seeding error or operating offline. Falling back to local state.", err);
      this.isInitialized = true;
    }
  }

  // Synchronous getters
  public getClinics(): Clinic[] {
    return this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
  }

  public getDoctors(): Doctor[] {
    return this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
  }

  public getAppointments(): Appointment[] {
    const raw = this.getLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS);
    return normalizeAppointmentNumbers(raw);
  }

  public getTickets(): SupportTicket[] {
    return this.getLocal(LOCAL_STORAGE_KEY_TICKETS, INITIAL_SUPPORT_TICKETS);
  }

  // Alias methods for convenience
  public onClinicsChange(callback: (clinics: Clinic[]) => void): () => void {
    return this.subscribeToClinics(callback);
  }

  public onDoctorsChange(callback: (doctors: Doctor[]) => void): () => void {
    return this.subscribeToDoctors(callback);
  }

  public onAppointmentsChange(callback: (appointments: Appointment[]) => void): () => void {
    return this.subscribeToAppointments(callback);
  }

  public onTicketsChange(callback: (tickets: SupportTicket[]) => void): () => void {
    return this.subscribeToTickets(callback);
  }

  public async addAppointment(appointment: Appointment): Promise<void> {
    return this.createAppointment(appointment);
  }

  public async addClinic(clinic: Clinic): Promise<void> {
    return this.saveClinic(clinic);
  }

  public async addDoctor(doctor: Doctor): Promise<void> {
    try {
      await setDoc(doc(db, 'doctors', doctor.id), doctor);
    } catch (e) {
      console.warn("Error adding doctor to Firestore", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
    const updated = [doctor, ...current.filter(d => d.id !== doctor.id)];
    this.setLocal(LOCAL_STORAGE_KEY_DOCTORS, updated);
  }

  public async resolveTicket(ticketId: string): Promise<void> {
    return this.updateTicket(ticketId, { status: 'resolved' });
  }

  // Fallback local storage helpers
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  }

  // Real-time Listeners
  public subscribeToClinics(callback: (clinics: Clinic[]) => void): () => void {
    try {
      const q = query(collection(db, 'clinics'), orderBy('priorityNumber', 'asc'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Clinic[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Clinic);
          });
          this.setLocal(LOCAL_STORAGE_KEY_CLINICS, list);
          callback(list);
        } else {
          const fallback = this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
          callback(fallback);
        }
      }, (err) => {
        console.warn("Clinics snapshot error, using cached data:", err);
        const fallback = this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
        callback(fallback);
      });
    } catch {
      const fallback = this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
      callback(fallback);
      return () => {};
    }
  }

  public subscribeToDoctors(callback: (doctors: Doctor[]) => void): () => void {
    try {
      const q = query(collection(db, 'doctors'), orderBy('priorityNumber', 'asc'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Doctor[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Doctor);
          });
          this.setLocal(LOCAL_STORAGE_KEY_DOCTORS, list);
          callback(list);
        } else {
          const fallback = this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
          callback(fallback);
        }
      }, (err) => {
        console.warn("Doctors snapshot error, using cached data:", err);
        const fallback = this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
        callback(fallback);
      });
    } catch {
      const fallback = this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
      callback(fallback);
      return () => {};
    }
  }

  public subscribeToAppointments(callback: (appointments: Appointment[]) => void): () => void {
    if (!this.appointmentListeners.includes(callback)) {
      this.appointmentListeners.push(callback);
    }
    // Immediately emit current data
    const initial = this.getAppointments();
    callback(initial);

    try {
      const q = query(collection(db, 'appointments'));
      const unsub = onSnapshot(q, (snapshot) => {
        const list: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Appointment);
        });
        if (list.length > 0) {
          const normalized = normalizeAppointmentNumbers(list);
          this.setLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, normalized);
          this.notifyAppointmentListeners(normalized);
        } else {
          const fallback = normalizeAppointmentNumbers(this.getLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS));
          callback(fallback);
        }
      }, (err) => {
        console.warn("Appointments snapshot error, using cached data:", err);
        const fallback = normalizeAppointmentNumbers(this.getLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS));
        callback(fallback);
      });

      return () => {
        unsub();
        this.appointmentListeners = this.appointmentListeners.filter(l => l !== callback);
      };
    } catch {
      const fallback = normalizeAppointmentNumbers(this.getLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS));
      callback(fallback);
      return () => {
        this.appointmentListeners = this.appointmentListeners.filter(l => l !== callback);
      };
    }
  }

  public subscribeToTickets(callback: (tickets: SupportTicket[]) => void): () => void {
    try {
      const q = query(collection(db, 'supportTickets'));
      return onSnapshot(q, (snapshot) => {
        const list: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as SupportTicket);
        });
        if (list.length > 0) {
          this.setLocal(LOCAL_STORAGE_KEY_TICKETS, list);
          callback(list);
        } else {
          const fallback = this.getLocal(LOCAL_STORAGE_KEY_TICKETS, INITIAL_SUPPORT_TICKETS);
          callback(fallback);
        }
      }, (err) => {
        console.warn("Support tickets snapshot error, using cached data:", err);
        const fallback = this.getLocal(LOCAL_STORAGE_KEY_TICKETS, INITIAL_SUPPORT_TICKETS);
        callback(fallback);
      });
    } catch {
      const fallback = this.getLocal(LOCAL_STORAGE_KEY_TICKETS, INITIAL_SUPPORT_TICKETS);
      callback(fallback);
      return () => {};
    }
  }

  // Mutations
  public async createAppointment(appointment: Appointment): Promise<void> {
    try {
      // Remove any undefined fields so Firestore setDoc never throws an exception
      const cleanData: Record<string, any> = {};
      for (const [key, value] of Object.entries(appointment)) {
        if (value !== undefined) {
          cleanData[key] = value;
        }
      }
      await setDoc(doc(db, 'appointments', appointment.id), cleanData);
    } catch (e) {
      console.warn("Error creating appointment in Firestore, storing locally", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = [appointment, ...current.filter(a => a.id !== appointment.id)];
    this.setLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, updated);
    this.notifyAppointmentListeners(updated);
  }

  public async updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const cleanUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      }
      await updateDoc(doc(db, 'appointments', id), cleanUpdates as any);
    } catch (e) {
      console.warn("Error updating appointment in Firestore, storing locally", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = current.map(a => a.id === id ? { ...a, ...updates } : a);
    this.setLocal(LOCAL_STORAGE_KEY_APPOINTMENTS, updated);
    this.notifyAppointmentListeners(updated);
  }

  public async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<void> {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), updates as any);
    } catch (e) {
      console.warn("Error updating doctor in Firestore, storing locally", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
    const updated = current.map(d => d.id === doctorId ? { ...d, ...updates } : d);
    this.setLocal(LOCAL_STORAGE_KEY_DOCTORS, updated);
  }

  public async saveClinic(clinic: Clinic): Promise<void> {
    try {
      await setDoc(doc(db, 'clinics', clinic.id), clinic);
    } catch (e) {
      console.warn("Error saving clinic in Firestore, storing locally", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
    const updated = [clinic, ...current.filter(c => c.id !== clinic.id)];
    this.setLocal(LOCAL_STORAGE_KEY_CLINICS, updated);
  }

  public async updateClinic(clinicId: string, updates: Partial<Clinic>): Promise<void> {
    try {
      await updateDoc(doc(db, 'clinics', clinicId), updates as any);
    } catch (e) {
      console.warn("Error updating clinic in Firestore, storing locally", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
    const updated = current.map(c => c.id === clinicId ? { ...c, ...updates } : c);
    this.setLocal(LOCAL_STORAGE_KEY_CLINICS, updated);
  }

  public async deleteClinic(clinicId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'clinics', clinicId));
    } catch (e) {
      console.warn("Error deleting clinic from Firestore", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_CLINICS, INITIAL_CLINICS);
    const updated = current.filter(c => c.id !== clinicId);
    this.setLocal(LOCAL_STORAGE_KEY_CLINICS, updated);
  }

  public async deleteDoctor(doctorId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'doctors', doctorId));
    } catch (e) {
      console.warn("Error deleting doctor from Firestore", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_DOCTORS, INITIAL_DOCTORS);
    const updated = current.filter(d => d.id !== doctorId);
    this.setLocal(LOCAL_STORAGE_KEY_DOCTORS, updated);
  }

  public async createTicket(ticket: SupportTicket): Promise<void> {
    try {
      await setDoc(doc(db, 'supportTickets', ticket.id), ticket);
    } catch (e) {
      console.warn("Error creating ticket in Firestore", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_TICKETS, INITIAL_SUPPORT_TICKETS);
    const updated = [ticket, ...current];
    this.setLocal(LOCAL_STORAGE_KEY_TICKETS, updated);
  }

  public async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), updates as any);
    } catch (e) {
      console.warn("Error updating ticket in Firestore", e);
    }
    const current = this.getLocal(LOCAL_STORAGE_KEY_TICKETS, INITIAL_SUPPORT_TICKETS);
    const updated = current.map(t => t.id === ticketId ? { ...t, ...updates } : t);
    this.setLocal(LOCAL_STORAGE_KEY_TICKETS, updated);
  }

  // Find Clinic by authorized Gmail or clinic email
  public findClinicByAuthorizedGmail(email?: string | null): Clinic | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    const clinics = this.getClinics();
    return clinics.find(c => 
      (c.authorizedGmails || []).some(g => (g || '').trim().toLowerCase() === clean) ||
      (c.email && c.email.trim().toLowerCase() === clean)
    );
  }

  // Check if an email is an authorized Doctor or Clinic/Hospital Staff Gmail
  public isAuthorizedDoctorOrStaffGmail(email?: string | null): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    if (
      clean === 'curayu@gmail.com' ||
      clean === 'mydehridoctor@gmail.com' ||
      clean.startsWith('dr.') ||
      clean.includes('doctor')
    ) {
      return true;
    }
    const clinicMatch = this.findClinicByAuthorizedGmail(clean);
    if (clinicMatch) return true;
    const docMatch = this.findDoctorByEmail(clean);
    return !!docMatch;
  }

  // Doctor by Email
  public findDoctorByEmail(email: string): Doctor | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    const doctors = this.getDoctors();
    
    // Explicit mapping for official Doctor Portal email
    if (clean === 'curayu@gmail.com' || clean === 'mydehridoctor@gmail.com' || clean === 'dr.rksharma@gmail.com') {
      return doctors.find(d => d.id === 'doc-r-k-sharma' || (d.email || '').toLowerCase() === 'mydehridoctor@gmail.com') || doctors[0];
    }

    const exact = doctors.find(d => (d.email || '').trim().toLowerCase() === clean);
    if (exact) return exact;

    // Partial match if email contains doctor ID or username
    const username = clean.split('@')[0];
    return doctors.find(d => {
      const docEmail = (d.email || '').toLowerCase();
      return docEmail && docEmail.includes(username);
    });
  }

  // Ensure or create a doctor profile for any authorized doctor Gmail
  public getOrCreateDoctorByEmail(email: string, suggestedName?: string): Doctor {
    const existing = this.findDoctorByEmail(email);
    if (existing) return existing;

    const clean = email.trim().toLowerCase();
    const doctors = this.getDoctors();
    const clinics = this.getClinics();
    // Check if email is associated with a specific clinic
    const matchedClinic = this.findClinicByAuthorizedGmail(clean);
    const assignedClinic = matchedClinic || clinics[0] || { id: 'seva-clinic', name: 'Seva Clinic & Diagnostic Center' };

    // Format a friendly name from email (e.g. dr.anilkumar -> Dr. Anil Kumar)
    let displayName = suggestedName;
    if (!displayName) {
      const prefix = clean.split('@')[0].replace(/^dr\.?/, '').replace(/[._-]/g, ' ').trim();
      const capitalized = prefix.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      displayName = `Dr. ${capitalized || 'Specialist'}`;
    }

    const newDocId = 'doc-' + clean.split('@')[0].replace(/[^a-z0-9]/g, '-');
    const newDoctor: Doctor = {
      id: newDocId,
      name: displayName,
      nameHindi: displayName,
      email: clean,
      clinicId: assignedClinic.id,
      clinicName: assignedClinic.name,
      specialty: 'General Physician & Consultant',
      specialtyHindi: 'सामान्य परामर्श विशेषज्ञ',
      qualification: 'MBBS, MD',
      experienceYears: 10,
      fee: 300,
      status: 'active',
      isVipBoosted: true,
      priorityNumber: doctors.length + 1,
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      about: `${displayName} is an experienced medical specialist serving OPD patients with comprehensive clinical consultations and personalized digital care in India.`,
      aboutHindi: `${displayName} भारत के अनुभवी चिकित्सा विशेषज्ञ हैं जो मरीजों को व्यक्तिगत डिजिटल स्वास्थ्य सेवाएं एवं परामर्श प्रदान करते हैं।`,
      nextSlot: 'Today 11:30 AM',
      availableToday: true,
      daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'],
      rating: 4.9,
      patientsServed: 1200
    };

    // Save to cache & Firestore
    this.addDoctor(newDoctor);
    return newDoctor;
  }
}

export function isSuperAdminEmail(email?: string | null): boolean {
  return (email || '').trim().toLowerCase() === 'saassuvidha@gmail.com';
}

export function isDoctorEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return dataService.isAuthorizedDoctorOrStaffGmail(clean);
}

export const dataService = DataService.getInstance();
