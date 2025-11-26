export interface FeedbackType {
  id: string;
  customerId: string;
  professionalId: string;
  rate: number;
  testimony?: string | null;
  createdAt: string;
  customerName?: string;
}
