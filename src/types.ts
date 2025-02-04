// Add to the existing types.ts file:

export interface RelationshipMilestone {
  type: string;
  timestamp: Date;
  description: string;
  message: string;
  sender?: string;
  duration?: number;
}

// Update the AIAnalysis interface
export interface AIAnalysis {
  content: string | null;
  success: boolean;
  error?: string;
  milestones?: RelationshipMilestone[];
}