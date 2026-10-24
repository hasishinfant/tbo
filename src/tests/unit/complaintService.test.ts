import { describe, it, expect, beforeEach } from 'vitest';
import { complaintService } from '../../services/complaintService';

describe('Emergency & Hotel Complaint Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides available hotels with user bookings and catalog entries', () => {
    const hotels = complaintService.getAvailableHotels();
    expect(hotels.length).toBeGreaterThan(0);

    // Verify hotel structure
    const first = hotels[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('city');
  });

  it('submits a hotel complaint and returns a valid reference ID and persisted record', async () => {
    const complaint = await complaintService.submitHotelComplaint({
      hotelId: 'TAJ001',
      hotelName: 'The Grand Palace Hotel',
      hotelCity: 'Mumbai',
      isExternalHotel: false,
      bookingReference: 'TBO-HTL-77412',
      roomNumber: '402',
      complaintCategory: 'room_cleanliness',
      complaintSubject: 'Dirty bathroom upon check-in',
      detailedDescription: 'The bathroom was not sanitized properly and towels were missing.',
      severity: 'medium',
      preferredResolution: 'room_change',
      contactNumber: '+1 (555) 234-5678',
      contactPreference: 'phone',
    });

    expect(complaint.id).toMatch(/^TS-HTL-\d{4}-\d{4}$/);
    expect(complaint.category).toBe('hotel');
    expect(complaint.hotelName).toBe('The Grand Palace Hotel');
    expect(complaint.status).toBe('submitted');
    expect(complaint.statusHistory.length).toBeGreaterThan(0);
    expect(complaint.followUpMessages.length).toBeGreaterThan(0);

    // Check retrieval
    const retrieved = complaintService.getRequestById(complaint.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(complaint.id);
  });

  it('submits a medical emergency with urgency and location', async () => {
    const medical = await complaintService.submitMedicalEmergency({
      assistanceType: 'illness',
      description: 'Severe fever and chills for the past 6 hours.',
      location: 'Colaba, Mumbai, India',
      urgency: 'within_2_hours',
      hasTravelInsurance: true,
      insuranceProvider: 'Allianz',
      contactNumber: '+1 (555) 345-6789',
      contactPreference: 'whatsapp',
    });

    expect(medical.id).toMatch(/^TS-MED-\d{4}-\d{4}$/);
    expect(medical.category).toBe('medical');
    expect(medical.status).toBe('submitted');
  });

  it('submits a lost passport report with issuing country and police report status', async () => {
    const passport = await complaintService.submitPassportEmergency({
      documentType: 'passport',
      issuingCountry: 'United States',
      incidentDate: '2026-10-24',
      incidentLocation: 'Heathrow Airport Terminal 2',
      description: 'Backpack left in coffee shop containing passport and boarding pass.',
      policeReportFiled: true,
      policeReportNumber: 'MET-98124',
      contactNumber: '+1 (555) 456-7890',
      contactPreference: 'email',
    });

    expect(passport.id).toMatch(/^TS-DOC-\d{4}-\d{4}$/);
    expect(passport.category).toBe('passport');
    expect(passport.issuingCountry).toBe('United States');
  });

  it('allows travelers to append follow-up messages and persists them', async () => {
    const complaint = await complaintService.submitHotelComplaint({
      hotelId: 'HYATT001',
      hotelName: 'City Center Business Hotel',
      hotelCity: 'New Delhi',
      isExternalHotel: false,
      complaintCategory: 'amenities_condition',
      complaintSubject: 'Air conditioner malfunctioning',
      detailedDescription: 'AC is blowing warm air in Room 204.',
      severity: 'high',
      preferredResolution: 'facility_repair',
      contactNumber: '+1 (555) 999-8888',
      contactPreference: 'phone',
    });

    const updated = await complaintService.addFollowUpMessage(
      complaint.id,
      'Hotel engineering arrived and repaired the unit. Thank you!',
      'Demo Traveler'
    );

    expect(updated.followUpMessages.length).toBe(2);
    const lastMsg = updated.followUpMessages[updated.followUpMessages.length - 1];
    expect(lastMsg.sender).toBe('user');
    expect(lastMsg.message).toBe('Hotel engineering arrived and repaired the unit. Thank you!');
  });

  it('updates request status and maintains history audit log', async () => {
    const complaint = await complaintService.submitHotelComplaint({
      hotelId: 'TAJ001',
      hotelName: 'The Grand Palace Hotel',
      hotelCity: 'Mumbai',
      isExternalHotel: false,
      complaintCategory: 'booking_reservation',
      complaintSubject: 'Late check-in dispute',
      detailedDescription: 'Front desk requested additional fee for late check-in.',
      severity: 'low',
      preferredResolution: 'refund_compensation',
      contactNumber: '+1 (555) 111-2222',
      contactPreference: 'email',
    });

    const updated = await complaintService.updateRequestStatus(
      complaint.id,
      'in_progress',
      'Assigned to Guest Relations Manager.'
    );

    expect(updated.status).toBe('in_progress');
    expect(updated.statusHistory.length).toBe(2);
    expect(updated.statusHistory[1].status).toBe('in_progress');
  });
});
