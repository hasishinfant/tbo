/**
 * Emergency Support & Hotel Complaint Service
 * 
 * Provides robust persistence, validation, status tracking, and multi-hotel support
 * for TravelSphere Emergency Support and Complaints.
 */

export type EmergencyCategory = 'medical' | 'passport' | 'hotel' | 'local';

export type RequestStatus = 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StatusHistoryItem {
  status: RequestStatus;
  timestamp: string;
  note: string;
  agentName?: string;
}

export interface FollowUpMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface BaseEmergencyRecord {
  id: string;
  category: EmergencyCategory;
  categoryLabel: string;
  userId?: string;
  userName: string;
  userEmail: string;
  contactNumber: string;
  contactPreference: 'phone' | 'email' | 'whatsapp';
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  statusHistory: StatusHistoryItem[];
  followUpMessages: FollowUpMessage[];
}

export interface MedicalEmergencyRecord extends BaseEmergencyRecord {
  category: 'medical';
  assistanceType: 'injury' | 'illness' | 'prescription' | 'dental' | 'hospital_referral' | 'other';
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  urgency: 'immediate' | 'within_2_hours' | 'within_24_hours';
  hasTravelInsurance: boolean;
  insuranceProvider?: string;
  medicalConditionsOrAllergies?: string;
}

export interface PassportEmergencyRecord extends BaseEmergencyRecord {
  category: 'passport';
  documentType: 'passport' | 'visa' | 'national_id' | 'driving_license' | 'boarding_pass';
  issuingCountry: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  policeReportFiled: boolean;
  policeReportNumber?: string;
  upcomingDepartureDate?: string;
}

export interface HotelComplaintRecord extends BaseEmergencyRecord {
  category: 'hotel';
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  hotelAddress?: string;
  isExternalHotel: boolean;
  bookingReference?: string;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  complaintCategory: 
    | 'booking_reservation'
    | 'room_cleanliness'
    | 'amenities_condition'
    | 'staff_service'
    | 'billing_charges'
    | 'cancellation_refund'
    | 'checkin_checkout'
    | 'safety_security'
    | 'other';
  complaintSubject: string;
  detailedDescription: string;
  severity: SeverityLevel;
  preferredResolution: 
    | 'refund_compensation'
    | 'room_change'
    | 'apology_explanation'
    | 'service_credit'
    | 'facility_repair'
    | 'other';
  attachments?: string[];
}

export interface LocalAssistanceRecord extends BaseEmergencyRecord {
  category: 'local';
  assistanceType: 'directions' | 'transportation' | 'translation' | 'safety' | 'lost_item' | 'other';
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  urgency: 'high' | 'medium' | 'standard';
}

export type EmergencyComplaintRecord = 
  | MedicalEmergencyRecord 
  | PassportEmergencyRecord 
  | HotelComplaintRecord 
  | LocalAssistanceRecord;

export interface AvailableHotel {
  id: string;
  name: string;
  city: string;
  address?: string;
  starRating?: number;
  bookingReference?: string;
  checkIn?: string;
  checkOut?: string;
  isUserBooking?: boolean;
}

const STORAGE_KEY = 'travelsphere_emergency_complaints';

// Default catalog of hotels supported in TravelSphere
export const HOTEL_CATALOG: AvailableHotel[] = [
  {
    id: 'TAJ001',
    name: 'The Grand Palace Hotel',
    city: 'Mumbai',
    address: '123 Marine Drive, Colaba, Mumbai, India',
    starRating: 5,
  },
  {
    id: 'HYATT001',
    name: 'City Center Business Hotel',
    city: 'New Delhi',
    address: '456 MG Road, Connaught Place, New Delhi, India',
    starRating: 4,
  },
  {
    id: 'COMF001',
    name: 'Comfort Inn Express',
    city: 'Bengaluru',
    address: '78 Hosur Road, Koramangala, Bengaluru, India',
    starRating: 3,
  },
  {
    id: 'HERI001',
    name: 'Heritage Boutique Suites',
    city: 'Jaipur',
    address: '12 Amer Palace Road, Jaipur, India',
    starRating: 4,
  },
  {
    id: 'RESORT001',
    name: 'Tropical Paradise Resort & Spa',
    city: 'Goa',
    address: 'Sunset Beach Road, Calangute, Goa, India',
    starRating: 5,
  },
  {
    id: 'TRANS001',
    name: 'Airport Transit Hotel',
    city: 'Dubai',
    address: 'Terminal 3 Concourse B, Dubai, UAE',
    starRating: 3,
  },
];

// Pre-seeded demo records for immediate verification
const INITIAL_DEMO_RECORDS: EmergencyComplaintRecord[] = [
  {
    id: 'TS-HTL-2026-7841',
    category: 'hotel',
    categoryLabel: 'Hotel & Accommodation Issue',
    userName: 'Demo Traveler',
    userEmail: 'demo@travelsphere.com',
    contactNumber: '+1 (555) 234-5678',
    contactPreference: 'phone',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: 'in_progress',
    hotelId: 'TAJ001',
    hotelName: 'The Grand Palace Hotel',
    hotelCity: 'Mumbai',
    hotelAddress: '123 Marine Drive, Colaba, Mumbai, India',
    isExternalHotel: false,
    bookingReference: 'TBO-HTL-77412',
    roomNumber: 'Suite 408',
    checkInDate: '2026-11-01',
    checkOutDate: '2026-11-05',
    complaintCategory: 'room_cleanliness',
    complaintSubject: 'Air conditioning malfunction & incomplete room sanitization',
    detailedDescription: 'Upon check-in to Suite 408, the air conditioning unit was leaking water onto the floor and the bathroom had not been properly sanitized before our arrival. We spoke with the front desk but no technician arrived for 3 hours.',
    severity: 'high',
    preferredResolution: 'room_change',
    attachments: ['ac_leakage_photo.jpg', 'bathroom_condition.jpg'],
    statusHistory: [
      {
        status: 'submitted',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        note: 'Complaint registered successfully and assigned priority queue.',
      },
      {
        status: 'under_review',
        timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        note: 'Case assigned to TravelSphere Hospitality Liaison Officer.',
        agentName: 'Sarah Jenkins (TravelSphere Support)',
      },
      {
        status: 'in_progress',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        note: 'Contacted Duty Manager at The Grand Palace Hotel. Upgraded suite requested with complimentary breakfast credit.',
        agentName: 'Sarah Jenkins (TravelSphere Support)',
      },
    ],
    followUpMessages: [
      {
        id: 'msg-1',
        sender: 'support',
        senderName: 'Sarah Jenkins (TravelSphere Liaison)',
        message: 'Hello, I have reached out directly to the General Manager at The Grand Palace Hotel. They are preparing Room 612 (Executive Bay Suite) for an immediate complimentary room change for you.',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'user',
        senderName: 'Demo Traveler',
        message: 'Thank you Sarah, the hotel staff just came to assist with our luggage to the new room. Much appreciated!',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'TS-MED-2026-3109',
    category: 'medical',
    categoryLabel: 'Medical Emergency',
    userName: 'Demo Traveler',
    userEmail: 'demo@travelsphere.com',
    contactNumber: '+1 (555) 234-5678',
    contactPreference: 'whatsapp',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: 'resolved',
    assistanceType: 'prescription',
    description: 'Lost critical blood pressure medication while in transit in Tokyo. Needed urgent English-speaking physician consultation and local prescription fulfillment.',
    location: 'Shinjuku, Tokyo, Japan',
    urgency: 'within_2_hours',
    hasTravelInsurance: true,
    insuranceProvider: 'Allianz Global Assistance',
    medicalConditionsOrAllergies: 'Hypertension, Penicillin allergy',
    statusHistory: [
      {
        status: 'submitted',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        note: 'Medical assistance request filed.',
      },
      {
        status: 'in_progress',
        timestamp: new Date(Date.now() - (5 * 24 - 1) * 3600 * 1000).toISOString(),
        note: 'English-speaking clinic located: Tokyo Medical Clinic (Roppongi). Tele-consult scheduled.',
        agentName: 'Dr. Kenji Tanaka / SOS Coordinator',
      },
      {
        status: 'resolved',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        note: 'Prescription filled at Roppongi Hills Pharmacy. Traveler confirmed receipt of medication.',
        agentName: 'Dr. Kenji Tanaka / SOS Coordinator',
      },
    ],
    followUpMessages: [
      {
        id: 'msg-med-1',
        sender: 'support',
        senderName: 'Tokyo SOS Coordinator',
        message: 'Your tele-consultation is confirmed. A doctor will connect via secure video call in 15 minutes to authorize the refill in Tokyo.',
        timestamp: new Date(Date.now() - (5 * 24 - 1) * 3600 * 1000).toISOString(),
      },
    ],
  },
];

class EmergencyComplaintService {
  /**
   * Get all emergency and complaint records from localStorage
   */
  getStoredRequests(): EmergencyComplaintRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default realistic records
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_RECORDS));
        return INITIAL_DEMO_RECORDS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse emergency requests from localStorage:', e);
      return INITIAL_DEMO_RECORDS;
    }
  }

  /**
   * Save records to localStorage
   */
  private saveRequests(requests: EmergencyComplaintRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('emergency-requests-updated'));
      }
    } catch (e) {
      console.error('Failed to save emergency requests to localStorage:', e);
    }
  }

  /**
   * Get request by unique reference ID
   */
  getRequestById(id: string): EmergencyComplaintRecord | undefined {
    const all = this.getStoredRequests();
    return all.find(r => r.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Get hotels associated with user bookings, combined with the general catalog
   */
  getAvailableHotels(): AvailableHotel[] {
    const hotelsMap = new Map<string, AvailableHotel>();

    // 1. Check user bookings from localStorage
    try {
      const storedBookings = localStorage.getItem('hotel_bookings');
      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        if (Array.isArray(bookings)) {
          bookings.forEach((b: any, index: number) => {
            const hotelName = b.hotel?.HotelName || b.hotelName || `Hotel Booking #${index + 1}`;
            const hotelId = b.hotel?.HotelCode || b.bookingReferenceId || `BOOKED-${index}`;
            hotelsMap.set(hotelId, {
              id: hotelId,
              name: hotelName,
              city: b.hotel?.CityName || 'Booked Destination',
              address: b.hotel?.HotelAddress,
              starRating: b.hotel?.StarRating || 4,
              bookingReference: b.confirmationNumber || b.bookingReferenceId || `TBO-HTL-${70000 + index}`,
              checkIn: b.checkIn ? new Date(b.checkIn).toISOString().split('T')[0] : '2026-11-01',
              checkOut: b.checkOut ? new Date(b.checkOut).toISOString().split('T')[0] : '2026-11-05',
              isUserBooking: true,
            });
          });
        }
      }
    } catch (e) {
      console.error('Error reading hotel bookings:', e);
    }

    // 2. Also check general bookings storage
    try {
      const generalBookings = localStorage.getItem('bookings');
      if (generalBookings) {
        const bookings = JSON.parse(generalBookings);
        if (Array.isArray(bookings)) {
          bookings.forEach((b: any, index: number) => {
            if (b.destination) {
              const id = `ITIN-HTL-${index}`;
              if (!hotelsMap.has(id)) {
                hotelsMap.set(id, {
                  id,
                  name: `Resort & Suites ${b.destination}`,
                  city: b.destination,
                  starRating: 4,
                  bookingReference: b.bookingId || `ITIN-${80000 + index}`,
                  checkIn: b.checkInDate || '2026-11-10',
                  checkOut: b.checkOutDate || '2026-11-15',
                  isUserBooking: true,
                });
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('Error reading itinerary bookings:', e);
    }

    // 3. If no user bookings yet, add 2 sample active user bookings so multi-hotel selector works out of the box
    if (hotelsMap.size === 0) {
      hotelsMap.set('TAJ001', {
        id: 'TAJ001',
        name: 'The Grand Palace Hotel',
        city: 'Mumbai',
        address: '123 Marine Drive, Colaba, Mumbai, India',
        starRating: 5,
        bookingReference: 'TBO-HTL-77412',
        checkIn: '2026-11-01',
        checkOut: '2026-11-05',
        isUserBooking: true,
      });
      hotelsMap.set('HYATT001', {
        id: 'HYATT001',
        name: 'City Center Business Hotel',
        city: 'New Delhi',
        address: '456 MG Road, Connaught Place, New Delhi, India',
        starRating: 4,
        bookingReference: 'TBO-HTL-89210',
        checkIn: '2026-11-12',
        checkOut: '2026-11-16',
        isUserBooking: true,
      });
    }

    // 4. Merge in general catalog hotels (flagged as non-user bookings)
    HOTEL_CATALOG.forEach(catHotel => {
      if (!hotelsMap.has(catHotel.id)) {
        hotelsMap.set(catHotel.id, {
          ...catHotel,
          isUserBooking: false,
        });
      }
    });

    return Array.from(hotelsMap.values());
  }

  /**
   * Helper to generate human-readable reference IDs
   */
  private generateReferenceId(prefix: string): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `TS-${prefix}-${new Date().getFullYear()}-${randomDigits}`;
  }

  /**
   * Helper to get active user details
   */
  private getActiveUserDetails() {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        return {
          userName: user.name || 'Traveler',
          userEmail: user.email || 'traveler@travelsphere.com',
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      userName: 'Demo Traveler',
      userEmail: 'demo@travelsphere.com',
    };
  }

  /**
   * Submit Hotel Complaint
   */
  async submitHotelComplaint(data: Omit<HotelComplaintRecord, 'id' | 'category' | 'categoryLabel' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory' | 'followUpMessages' | 'userName' | 'userEmail'>): Promise<HotelComplaintRecord> {
    const now = new Date().toISOString();
    const userInfo = this.getActiveUserDetails();
    const id = this.generateReferenceId('HTL');

    const newRecord: HotelComplaintRecord = {
      ...data,
      id,
      category: 'hotel',
      categoryLabel: 'Hotel & Accommodation Issue',
      userName: userInfo.userName,
      userEmail: userInfo.userEmail,
      createdAt: now,
      updatedAt: now,
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: `Complaint filed specifically for ${data.hotelName}${data.bookingReference ? ` (Ref: ${data.bookingReference})` : ''}. Case dispatched to hospitality liaison team.`,
        },
      ],
      followUpMessages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'support',
          senderName: 'TravelSphere Hotel Liaison Bot',
          message: `Thank you for reporting this issue regarding ${data.hotelName}. A hospitality specialist is reviewing your complaint and will follow up with the hotel management within 30 minutes.`,
          timestamp: now,
        },
      ],
    };

    const requests = this.getStoredRequests();
    requests.unshift(newRecord);
    this.saveRequests(requests);

    return newRecord;
  }

  /**
   * Submit Medical Emergency Request
   */
  async submitMedicalEmergency(data: Omit<MedicalEmergencyRecord, 'id' | 'category' | 'categoryLabel' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory' | 'followUpMessages' | 'userName' | 'userEmail'>): Promise<MedicalEmergencyRecord> {
    const now = new Date().toISOString();
    const userInfo = this.getActiveUserDetails();
    const id = this.generateReferenceId('MED');

    const newRecord: MedicalEmergencyRecord = {
      ...data,
      id,
      category: 'medical',
      categoryLabel: 'Medical Emergency',
      userName: userInfo.userName,
      userEmail: userInfo.userEmail,
      createdAt: now,
      updatedAt: now,
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: `Medical assistance request received for location: ${data.location}. Priority level: ${data.urgency}.`,
        },
      ],
      followUpMessages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'support',
          senderName: 'Medical SOS Dispatch',
          message: `Your medical request has been logged. If this is an immediate life-threatening emergency, please dial local emergency services (112 / 911) right now. Our medical coordinator is reviewing local provider options for ${data.location}.`,
          timestamp: now,
        },
      ],
    };

    const requests = this.getStoredRequests();
    requests.unshift(newRecord);
    this.saveRequests(requests);

    return newRecord;
  }

  /**
   * Submit Lost Passport & Documents Request
   */
  async submitPassportEmergency(data: Omit<PassportEmergencyRecord, 'id' | 'category' | 'categoryLabel' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory' | 'followUpMessages' | 'userName' | 'userEmail'>): Promise<PassportEmergencyRecord> {
    const now = new Date().toISOString();
    const userInfo = this.getActiveUserDetails();
    const id = this.generateReferenceId('DOC');

    const newRecord: PassportEmergencyRecord = {
      ...data,
      id,
      category: 'passport',
      categoryLabel: 'Lost Passport & Documents',
      userName: userInfo.userName,
      userEmail: userInfo.userEmail,
      createdAt: now,
      updatedAt: now,
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: `Lost ${data.documentType.toUpperCase()} reported for issuing country: ${data.issuingCountry}. Consular liaison notified.`,
        },
      ],
      followUpMessages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'support',
          senderName: 'Consular Assistance Desk',
          message: `We have received your report regarding your lost ${data.documentType}. We are preparing emergency travel document instructions and contact details for the nearest embassy of ${data.issuingCountry}.`,
          timestamp: now,
        },
      ],
    };

    const requests = this.getStoredRequests();
    requests.unshift(newRecord);
    this.saveRequests(requests);

    return newRecord;
  }

  /**
   * Submit Local Assistance Request
   */
  async submitLocalAssistance(data: Omit<LocalAssistanceRecord, 'id' | 'category' | 'categoryLabel' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory' | 'followUpMessages' | 'userName' | 'userEmail'>): Promise<LocalAssistanceRecord> {
    const now = new Date().toISOString();
    const userInfo = this.getActiveUserDetails();
    const id = this.generateReferenceId('LOC');

    const newRecord: LocalAssistanceRecord = {
      ...data,
      id,
      category: 'local',
      categoryLabel: 'Local Assistance',
      userName: userInfo.userName,
      userEmail: userInfo.userEmail,
      createdAt: now,
      updatedAt: now,
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: `Local travel assistance requested for ${data.assistanceType} at ${data.location}.`,
        },
      ],
      followUpMessages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'support',
          senderName: 'TravelSphere Local Concierge',
          message: `Your local assistance request has been received. Our regional travel guide team is reviewing your inquiry and will reach out shortly.`,
          timestamp: now,
        },
      ],
    };

    const requests = this.getStoredRequests();
    requests.unshift(newRecord);
    this.saveRequests(requests);

    return newRecord;
  }

  /**
   * Add a follow-up message to an existing ticket
   */
  async addFollowUpMessage(requestId: string, messageText: string, senderName: string = 'You'): Promise<EmergencyComplaintRecord> {
    const requests = this.getStoredRequests();
    const index = requests.findIndex(r => r.id.toLowerCase() === requestId.toLowerCase());

    if (index === -1) {
      throw new Error(`Request with ID ${requestId} not found.`);
    }

    const now = new Date().toISOString();
    const newMsg: FollowUpMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName,
      message: messageText,
      timestamp: now,
    };

    requests[index].followUpMessages.push(newMsg);
    requests[index].updatedAt = now;

    // Simulate an automatic acknowledgment response after adding a follow-up
    setTimeout(() => {
      try {
        const currentRequests = this.getStoredRequests();
        const curIndex = currentRequests.findIndex(r => r.id.toLowerCase() === requestId.toLowerCase());
        if (curIndex !== -1) {
          currentRequests[curIndex].followUpMessages.push({
            id: `msg-reply-${Date.now()}`,
            sender: 'support',
            senderName: 'Support Officer',
            message: `Thank you for the update. Our support team has logged this information into ticket ${requestId}.`,
            timestamp: new Date().toISOString(),
          });
          currentRequests[curIndex].updatedAt = new Date().toISOString();
          this.saveRequests(currentRequests);
        }
      } catch (err) {
        console.error('Failed to post simulated reply:', err);
      }
    }, 1200);

    this.saveRequests(requests);
    return requests[index];
  }

  /**
   * Update request status and record in statusHistory
   */
  async updateRequestStatus(
    requestId: string,
    newStatus: RequestStatus,
    note?: string,
    agentName?: string
  ): Promise<EmergencyComplaintRecord> {
    const requests = this.getStoredRequests();
    const index = requests.findIndex(r => r.id.toLowerCase() === requestId.toLowerCase());

    if (index === -1) {
      throw new Error(`Request with ID ${requestId} not found.`);
    }

    const now = new Date().toISOString();
    requests[index].status = newStatus;
    requests[index].updatedAt = now;

    if (!requests[index].statusHistory) {
      requests[index].statusHistory = [];
    }

    requests[index].statusHistory.push({
      status: newStatus,
      timestamp: now,
      note: note || `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
      agentName: agentName || 'TravelSphere Support',
    });

    this.saveRequests(requests);
    return requests[index];
  }
}

export const complaintService = new EmergencyComplaintService();
