// Destination-related type definitions
export interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  vrPreviewUrl?: string;
  popularityScore: number;
  category: string[];
}

export interface DestinationCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  vrPreviewUrl?: string;
  priority?: boolean; // For above-the-fold images
  onPlanTrip: (destinationId: string) => void;
  onVRPreview: (vrUrl: string) => void;
}

export interface DestinationGridProps {
  destinations: Destination[];
  onPlanTrip: (destinationId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export interface VRModalProps {
  vrUrl: string;
  onClose: () => void;
  isOpen: boolean;
}