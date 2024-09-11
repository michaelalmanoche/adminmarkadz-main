export interface User {
  id: number;
  username: string;
  role_id: number;
}

export interface Operator {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  license_no: string;
  contact: string;
  region: string;
  city: string;
  brgy: string;
  street: string;
}

export interface Van {
  firstname: string;
  lastname: string;
  id: number;
  mv_file_no: string;
  plate_number: string;
  engine_no: string;
  chassis_no: string;
  denomination: string;
  piston_displacement: string;
  number_of_cylinders: number;
  fuel: string;
  make: string;
  series: string;
  body_type: string;
  body_no: string;
  year_model: number;
  gross_weight: number;
  net_weight: number;
  shipping_weight: number;
  net_capacity: number;
  year_last_registered: number;
  expiration_date: string;
}

export interface SimpleVan {
  id: number;
  plate_number: string;
  firstname: string;
  lastname: string;
}

export interface QueuedVan extends Van {
  status: string;
}

export interface Assignment {
  id: number;
  van_id: number;
  operator_id: number;
  assigned_at: string;
}
