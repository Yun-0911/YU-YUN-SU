
export type ConcertDate = '03/07 (六)' | '03/08 (日)';

export interface TicketRequest {
  id: string;
  createdAt: number;
  date: ConcertDate;
  
  // Current ticket (Have)
  haveArea: string;
  haveRow: string;
  
  // Target ticket (Want)
  wantArea: string;
  wantRow: string;
  
  // Contact info
  contact: string;
  
  // Status
  isMatched: boolean;
  matchedWithId?: string;
}

export interface MatchResult {
  success: boolean;
  matchedRequest?: TicketRequest;
}
