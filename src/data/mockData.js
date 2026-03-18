export const initialHospitals = [
  {
    id: "hospital-1",
    name: "Sunrise Medical Center",
    location: "Hyderabad",
    email: "admin@sunrisehospital.com",
    phone: "+91 90000 10001",
    status: "active",
    adminIds: ["admin-1"],
    branding: "Sunrise Care",
    lastAudit: "2h ago",
  },
  {
    id: "hospital-2",
    name: "City Care Hospital",
    location: "Bengaluru",
    email: "admin@citycarehospital.com",
    phone: "+91 90000 10002",
    status: "inactive",
    adminIds: ["admin-2"],
    branding: "City Care Plus",
    lastAudit: "1d ago",
  },
];

export const initialAdmins = [
  {
    id: "admin-1",
    hospitalId: "hospital-1",
    name: "Rahul Sharma",
    email: "admin@sunrisehospital.com",
    phone: "+91 95555 10001",
  },
  {
    id: "admin-2",
    hospitalId: "hospital-2",
    name: "Sneha Verma",
    email: "admin@citycarehospital.com",
    phone: "+91 95555 10002",
  },
];

export const initialDoctors = [
  {
    id: "doctor-1",
    hospitalId: "hospital-1",
    name: "Dr. Anitha Reddy",
    specialty: "Cardiology",
    email: "anitha.reddy@sunrisehospital.com",
    phone: "+91 91111 11111",
  },
  {
    id: "doctor-2",
    hospitalId: "hospital-2",
    name: "Dr. Naveen Kumar",
    specialty: "Orthopedics",
    email: "naveen.kumar@citycarehospital.com",
    phone: "+91 92222 22222",
  },
];

export const initialNurses = [
  {
    id: "nurse-1",
    hospitalId: "hospital-1",
    name: "Priya Singh",
    department: "Emergency",
    email: "priya.singh@sunrisehospital.com",
    phone: "+91 93333 33333",
  },
  {
    id: "nurse-2",
    hospitalId: "hospital-2",
    name: "Meera Das",
    department: "Pediatrics",
    email: "meera.das@citycarehospital.com",
    phone: "+91 94444 44444",
  },
];

export const initialPatients = [
  {
    id: "patient-1",
    hospitalId: "hospital-1",
    name: "Ajay Kumar",
    condition: "Cardiac Follow-up",
    email: "ajay.kumar@example.com",
    phone: "+91 97777 11111",
  },
  {
    id: "patient-2",
    hospitalId: "hospital-2",
    name: "Riya Patel",
    condition: "Pediatrics Review",
    email: "riya.patel@example.com",
    phone: "+91 97777 22222",
  },
];

export const mockUsers = [
  {
    id: "superadmin-1",
    role: "superadmin",
    name: "Aarav Nair",
    email: "superadmin@hms.com",
    password: "123456",
  },
  {
    id: "admin-user-1",
    role: "admin",
    name: "Rahul Sharma",
    email: "admin@sunrisehospital.com",
    password: "123456",
    hospitalId: "hospital-1",
  },
  {
    id: "doctor-user-1",
    role: "doctor",
    name: "Dr. Anitha Reddy",
    email: "doctor@hms.com",
    password: "123456",
    hospitalId: "hospital-1",
  },
  {
    id: "nurse-user-1",
    role: "nurse",
    name: "Priya Singh",
    email: "nurse@hms.com",
    password: "123456",
    hospitalId: "hospital-1",
  },
  {
    id: "patient-user-1",
    role: "patient",
    name: "Ajay Kumar",
    email: "patient@hms.com",
    password: "123456",
    hospitalId: "hospital-1",
  },
];

export const initialNotifications = [
  {
    id: "notification-1",
    role: "superadmin",
    title: "Hospital status alert",
    message: "City Care Hospital is currently inactive and needs review.",
  },
  {
    id: "notification-2",
    role: "superadmin",
    title: "Staffing update",
    message: "Sunrise Medical Center added two new team members this week.",
  },
  {
    id: "notification-3",
    role: "admin",
    hospitalId: "hospital-1",
    title: "Patient queue",
    message: "12 patients are scheduled for check-in today.",
  },
  {
    id: "notification-4",
    role: "admin",
    hospitalId: "hospital-1",
    title: "System health",
    message: "All critical systems are stable and running normally.",
  },
];

export const adminConfigSections = [
  {
    id: "branding",
    title: "Branding Configuration",
    description: "Manage hospital identity, colors, banners, and branding assets.",
    items: "Logo, theme, welcome copy",
  },
  {
    id: "feature-toggles",
    title: "Feature Toggles",
    description: "Control enabled modules and availability for care workflows.",
    items: "Appointments, lab, billing",
  },
  {
    id: "master-data",
    title: "Master Data Management",
    description: "Review departments, service catalog, pricing, discounts, and roles.",
    items: "Departments, services, pricing",
  },
  {
    id: "content",
    title: "Content Management",
    description: "Publish health tips, articles, and promotional banners.",
    items: "Tips, articles, banners",
  },
  {
    id: "analytics",
    title: "Analytics and Reporting",
    description: "Track engagement, service utilization, and revenue dashboard highlights.",
    items: "Engagement, revenue, reports",
  },
  {
    id: "system-health",
    title: "System Health Monitoring",
    description: "Watch uptime, queue load, and incident readiness.",
    items: "Uptime, alerts, performance",
  },
];
