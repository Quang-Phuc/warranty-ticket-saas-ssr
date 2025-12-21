export type TicketStatus = 'RECEIVED' | 'CHECKING' | 'QUOTE_SENT' | 'APPROVED' | 'WAIT_PART' | 'FIXING' | 'DONE' | 'RETURNED' | 'CANCELLED';

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  customerName?: string;
  createdAt: string;
}
