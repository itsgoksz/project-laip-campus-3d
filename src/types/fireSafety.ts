export interface InspectionRecord {
  id: string;
  date: string;
  timestamp: string;
  inspector: string;
  type: 'Monthly Visual (NFPA 10)' | 'Annual Maintenance' | '6-Year Internal' | 'Hydrostatic Test' | 'Evacuation Drill';
  status: 'Passed' | 'Flagged' | 'Action Required';
  notes: string;
  checklist: {
    pressureGaugeOk: boolean;
    tamperSealIntact: boolean;
    noCorrosionOrDamage: boolean;
    mountingAndSignageOk: boolean;
    nozzleClear: boolean;
  };
}

export interface WorkOrder {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Completed';
  createdAt: string;
  technician: string;
  description: string;
}

export interface FireExtinguisherDetails {
  id: string;
  tag: string;
  name: string;
  location: string;
  floor: string;
  building: string;
  classification: string;
  ulRating: string;
  fireClasses: ('A' | 'B' | 'C' | 'D' | 'K')[];
  capacity: string;
  extinguishingAgent: string;
  serialNumber: string;
  manufacturer: string;
  manufactureDate: string;
  installDate: string;
  nextHydroTestDate: string;
  nextInternalInspectionDate: string;
  pressureMPa: number;
  minPressure: number;
  maxPressure: number;
  pinIntact: boolean;
  tamperSealIntact: boolean;
  lastInspectedDate: string;
  lastInspectedDaysAgo: number;
  inspectionDueInDays: number;
  complianceStatus: 'Compliant' | 'Due Soon' | 'Overdue' | 'Critical';
  mountingHeightInches: number; // NFPA requires max 60" for <= 40 lbs
  history: InspectionRecord[];
  workOrders: WorkOrder[];
}
