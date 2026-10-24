import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EmergencyLandingView } from '../../components/emergency/EmergencyLandingView';
import { HotelComplaintView } from '../../components/emergency/HotelComplaintView';
import { MedicalEmergencyView } from '../../components/emergency/MedicalEmergencyView';
import { LostPassportView } from '../../components/emergency/LostPassportView';
import { LocalAssistanceView } from '../../components/emergency/LocalAssistanceView';
import { ComplaintHistoryView } from '../../components/emergency/ComplaintHistoryView';
import { ComplaintDetailView } from '../../components/emergency/ComplaintDetailView';
import { complaintService } from '../../services/complaintService';

describe('Emergency Support UI & Functional Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ name: 'Demo Traveler', email: 'demo@travelsphere.com' }));
  });

  it('renders landing page with 4 primary assistance cards and emergency header', () => {
    const onSelectCategory = vi.fn();
    const onViewHistory = vi.fn();
    const onViewDetail = vi.fn();

    render(
      <MemoryRouter>
        <EmergencyLandingView
          onSelectCategory={onSelectCategory}
          onViewHistory={onViewHistory}
          onViewRequestDetail={onViewDetail}
        />
      </MemoryRouter>
    );

    // Verify Title & Compact Emergency Notice
    expect(screen.getByText(/Emergency Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Life-Threatening Emergency Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/911/i)).toBeInTheDocument();

    // Verify 4 Categories
    expect(screen.getByText('Medical Emergency')).toBeInTheDocument();
    expect(screen.getByText('Lost Passport & Documents')).toBeInTheDocument();
    expect(screen.getByText('Hotel & Accommodation Issue')).toBeInTheDocument();
    expect(screen.getByText('Local Travel Assistance')).toBeInTheDocument();

    // Click Hotel Category
    const hotelCard = screen.getByText('Hotel & Accommodation Issue').closest('.category-assistance-card');
    expect(hotelCard).not.toBeNull();
    fireEvent.click(hotelCard!);
    expect(onSelectCategory).toHaveBeenCalledWith('hotel');
  });

  it('submits a Hotel Complaint with multi-hotel selection and booking reference', async () => {
    const onBack = vi.fn();
    const onSuccessTrack = vi.fn();

    render(
      <MemoryRouter>
        <HotelComplaintView onBack={onBack} onSuccessTrack={onSuccessTrack} />
      </MemoryRouter>
    );

    // Verify 3 Hotel Selection Modes
    expect(screen.getByText(/My Booked Hotels/i)).toBeInTheDocument();
    expect(screen.getByText(/TravelSphere Hotel Directory/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Hotel \(Booked Externally\)/i)).toBeInTheDocument();

    // Fill Complaint Details
    const subjectInput = screen.getByPlaceholderText(/AC unit leaking water and room uncleaned/i);
    fireEvent.change(subjectInput, { target: { value: 'AC not functioning and room dusty' } });

    const descInput = screen.getByPlaceholderText(/Please provide full details including times/i);
    fireEvent.change(descInput, { target: { value: 'The air conditioner blows hot air and room was not cleaned on arrival.' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Official Complaint/i });
    fireEvent.click(submitBtn);

    // Verify Success State and Reference ID
    await waitFor(() => {
      expect(screen.getByText(/Complaint Officially Registered/i)).toBeInTheDocument();
      expect(screen.getByText(/TS-HTL-2026-/i)).toBeInTheDocument();
    });

    // Verify Track action
    const trackBtn = screen.getByRole('button', { name: /Track Complaint & Live Updates/i });
    fireEvent.click(trackBtn);
    expect(onSuccessTrack).toHaveBeenCalled();
  });

  it('validates required fields in Medical Emergency form before submitting', async () => {
    const onBack = vi.fn();
    const onSuccessTrack = vi.fn();

    render(
      <MemoryRouter>
        <MedicalEmergencyView onBack={onBack} onSuccessTrack={onSuccessTrack} />
      </MemoryRouter>
    );

    // Try submitting empty
    const submitBtn = screen.getByRole('button', { name: /Submit Medical Assistance Request/i });
    fireEvent.click(submitBtn);

    // Validation errors should appear
    expect(screen.getByText(/Please describe the symptoms/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter your current city/i)).toBeInTheDocument();

    // Fill valid inputs
    const descInput = screen.getByPlaceholderText(/Please provide details of current symptoms/i);
    fireEvent.change(descInput, { target: { value: 'Sudden high fever and food poisoning symptoms after dinner.' } });

    const locInput = screen.getByPlaceholderText(/e.g., Room 402, The Grand Palace Hotel/i);
    fireEvent.change(locInput, { target: { value: 'Grand Hotel, Rome, Italy' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Medical Request Registered/i)).toBeInTheDocument();
      expect(screen.getByText(/TS-MED-2026-/i)).toBeInTheDocument();
    });
  });

  it('submits a Lost Passport report with issuing country and police report details', async () => {
    const onBack = vi.fn();
    const onSuccessTrack = vi.fn();

    render(
      <MemoryRouter>
        <LostPassportView onBack={onBack} onSuccessTrack={onSuccessTrack} />
      </MemoryRouter>
    );

    const countryInput = screen.getByPlaceholderText(/e.g., United States, United Kingdom/i);
    fireEvent.change(countryInput, { target: { value: 'United Kingdom' } });

    const locInput = screen.getByPlaceholderText(/Terminal 2, Heathrow Airport/i);
    fireEvent.change(locInput, { target: { value: 'Metro Station Gare du Nord, Paris' } });

    const descInput = screen.getByPlaceholderText(/Describe where the documents were last seen/i);
    fireEvent.change(descInput, { target: { value: 'Passport pouch misplaced while boarding the train.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Document Assistance Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Consular Case Initiated/i)).toBeInTheDocument();
      expect(screen.getByText(/TS-DOC-2026-/i)).toBeInTheDocument();
      expect(screen.getByText(/Recommended Next Steps/i)).toBeInTheDocument();
    });
  });

  it('submits a Local Assistance request and renders confirmation', async () => {
    const onBack = vi.fn();
    const onSuccessTrack = vi.fn();

    render(
      <MemoryRouter>
        <LocalAssistanceView onBack={onBack} onSuccessTrack={onSuccessTrack} />
      </MemoryRouter>
    );

    const locInput = screen.getByPlaceholderText(/Near Tokyo Station/i);
    fireEvent.change(locInput, { target: { value: 'Alexanderplatz, Berlin' } });

    const descInput = screen.getByPlaceholderText(/Provide context, names of transport stations/i);
    fireEvent.change(descInput, { target: { value: 'Train strike cancelled regional service to Frankfurt airport.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Local Assistance Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Concierge Request Queued/i)).toBeInTheDocument();
      expect(screen.getByText(/TS-LOC-2026-/i)).toBeInTheDocument();
    });
  });

  it('renders Complaint History, allows searching, and opening detail view', async () => {
    // Seed a ticket
    await complaintService.submitHotelComplaint({
      hotelId: 'TAJ001',
      hotelName: 'The Grand Palace Hotel',
      hotelCity: 'Mumbai',
      isExternalHotel: false,
      bookingReference: 'TBO-HTL-77412',
      complaintCategory: 'room_cleanliness',
      complaintSubject: 'Dirty towels in room 301',
      detailedDescription: 'Housekeeping did not replace the used towels during afternoon service.',
      severity: 'low',
      preferredResolution: 'facility_repair',
      contactNumber: '+1 555 123 4567',
      contactPreference: 'whatsapp',
    });

    const onBack = vi.fn();
    const onSelectRequest = vi.fn();
    const onNewRequest = vi.fn();

    render(
      <MemoryRouter>
        <ComplaintHistoryView
          onBack={onBack}
          onSelectRequest={onSelectRequest}
          onNewRequest={onNewRequest}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/My Assistance & Complaint Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Dirty towels in room 301/i)).toBeInTheDocument();

    // Click on ticket
    const ticketCard = screen.getByText(/Dirty towels in room 301/i).closest('.ticket-card');
    expect(ticketCard).not.toBeNull();
    fireEvent.click(ticketCard!);
    expect(onSelectRequest).toHaveBeenCalled();
  });

  it('renders Complaint Detail view, allows sending follow-up messages and status simulation', async () => {
    const record = await complaintService.submitHotelComplaint({
      hotelId: 'TAJ001',
      hotelName: 'The Grand Palace Hotel',
      hotelCity: 'Mumbai',
      isExternalHotel: false,
      bookingReference: 'TBO-HTL-77412',
      complaintCategory: 'staff_service',
      complaintSubject: 'Front desk billing discrepancy',
      detailedDescription: 'Double charged for airport shuttle.',
      severity: 'medium',
      preferredResolution: 'refund_compensation',
      contactNumber: '+1 555 123 4567',
      contactPreference: 'phone',
    });

    const onBack = vi.fn();

    render(
      <MemoryRouter>
        <ComplaintDetailView requestId={record.id} onBack={onBack} />
      </MemoryRouter>
    );

    // Verify Case Information
    expect(screen.getByText(/Case Information/i)).toBeInTheDocument();
    expect(screen.getByText('Front desk billing discrepancy')).toBeInTheDocument();
    expect(screen.getByText('The Grand Palace Hotel')).toBeInTheDocument();

    // Verify Stepper
    expect(screen.getByText('1. Submitted')).toBeInTheDocument();
    expect(screen.getByText('2. Under Review')).toBeInTheDocument();

    // Send a follow-up reply
    const replyInput = screen.getByPlaceholderText(/Type an update or question for the liaison desk/i);
    fireEvent.change(replyInput, { target: { value: 'Manager refunded the shuttle charge. All good!' } });

    const sendBtn = screen.getByTitle('Send message');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Manager refunded the shuttle charge. All good!')).toBeInTheDocument();
    });

    // Test Status Transition Simulator
    const resolveBtn = screen.getByRole('button', { name: /Mark Resolved/i });
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      const resolvedElements = screen.getAllByText(/RESOLVED/i);
      expect(resolvedElements.length).toBeGreaterThan(0);
    });
  });
});
