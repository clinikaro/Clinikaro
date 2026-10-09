import { Doctor, Clinic } from '../types';

/**
 * Checks whether online appointment booking is currently started / active for a doctor and their clinic.
 * If either the doctor or clinic has paused appointment booking (isAppointmentBookingActive === false),
 * or doctor is on leave / inactive, booking is disallowed and patients should be routed to "Contact Now".
 */
export function isDoctorBookingAvailable(doctor?: Doctor | null, clinic?: Clinic | null): boolean {
  if (!doctor) return false;
  
  // Explicitly paused by doctor
  if (doctor.isAppointmentBookingActive === false) return false;
  
  // Explicitly paused by clinic
  if (clinic && clinic.isAppointmentBookingActive === false) return false;
  
  // If clinic is suspended
  if (clinic && clinic.status === 'suspended') return false;

  // If doctor is permanently inactive
  if (doctor.status === 'inactive') return false;
  
  return true;
}
