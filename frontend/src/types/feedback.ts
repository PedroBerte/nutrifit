export interface FeedbackType {
  id: string;
  customerId: string;
  professionalId: string;
  rate: number;
  testimony?: string | null;
  createdAt: string;
  customerName?: string;
}

export interface CreateFeedbackRequest {
  professionalId: string;
  customerId: string;
  rate: number;
  testimony?: string;
}

export interface FeedbackResponse {
  id: string;
  professionalId: string;
  customerId: string;
  professionalName: string;
  customerName: string;
  professionalImageUrl?: string;
  customerImageUrl?: string;
  rate: number;
  testimony?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

