export type AnnouncementCategory =
  | "admission"
  | "exam"
  | "recruitment"
  | "event"
  | "result"
  | "scholarship"
  | "accreditation"
  | "general";

export interface Announcement {
  id: string;
  slug: string;
  title: string;
  date: string;
  isoDate: string;
  category: AnnouncementCategory;
  isNew?: boolean;
  hasDetailPage?: boolean;
  summary?: string;
  content?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
}

export const announcements: Announcement[] = [
  {
    id: "nba-esar-ec-2026",
    slug: "nba-esar-ec-2026",
    title: "NBA eSAR Submission for Electronics & Communication Department – 2025-26",
    date: "27 Feb 2026",
    isoDate: "2026-02-27",
    category: "accreditation",
    isNew: true,
    hasDetailPage: true,
    summary: "The Electronics & Communication Engineering department has submitted its NBA eSAR for the 2025-26 accreditation cycle.",
    content: `Government Polytechnic Palanpur is pleased to announce that the Electronics & Communication Engineering department has successfully submitted its NBA eSAR (Electronic Self-Assessment Report) for the 2025-26 accreditation cycle. This marks an important step toward achieving NBA accreditation for the EC department, joining Civil, Electrical, and Mechanical Engineering which are already accredited.`,
    attachmentUrl: "/documents/nba-esar-ec-2026.pdf",
    attachmentLabel: "Download eSAR Summary",
  },
  {
    id: "adm-2026-27",
    slug: "adm-2026-27",
    title: "Admissions Open for Academic Year 2026-27 – Apply via ACPDC Portal",
    date: "1 Feb 2026",
    isoDate: "2026-02-01",
    category: "admission",
    isNew: true,
    hasDetailPage: true,
    summary: "Diploma admissions for 2026-27 are now open through the ACPDC portal. Apply before the deadline.",
    content: `Admissions for the academic year 2026-27 are now open for all diploma engineering programs at Government Polytechnic Palanpur. Eligible candidates may apply through the official ACPDC (Admission Committee for Professional Diploma Courses) portal at www.acpdc.in. \n\nEligibility: Passed SSC (10th standard) with minimum 35% aggregate marks.\n\nAvailable programs and seats:\n- Civil Engineering: 118 seats\n- Electrical Engineering: 78 seats\n- Mechanical Engineering: 78 seats\n- Electronics & Communication: 38 seats\n- ICT: 78 seats\n- Information Technology: 38 seats`,
  },
  {
    id: "exam-tt-mar-2026",
    slug: "exam-tt-mar-2026",
    title: "GTU Winter Examination 2025 – Revised Timetable Released",
    date: "25 Jan 2026",
    isoDate: "2026-01-25",
    category: "exam",
    isNew: true,
    hasDetailPage: true,
    summary: "The revised timetable for GTU Winter Examination 2025 is now available. Students are advised to check their updated schedule.",
    content: `Gujarat Technological University has released the revised timetable for the Winter Examination 2025. Students are advised to download and review the updated schedule carefully. Any discrepancies in hall tickets or enrollment should be reported to the examination section immediately.`,
    attachmentUrl: "/documents/gtu-winter-2025-revised-tt.pdf",
    attachmentLabel: "Download Revised Timetable",
  },
  {
    id: "faculty-rect-2026",
    slug: "faculty-rect-2026",
    title: "Guest Faculty Recruitment – Applications Invited for Multiple Departments",
    date: "20 Jan 2026",
    isoDate: "2026-01-20",
    category: "recruitment",
    isNew: true,
    hasDetailPage: true,
    summary: "GP Palanpur invites applications for guest faculty positions in Civil, Mechanical, Electrical, and IT departments.",
    content: `Government Polytechnic Palanpur invites applications from qualified candidates for guest faculty positions in the following departments:\n\n- Civil Engineering\n- Mechanical Engineering\n- Electrical Engineering\n- Information Technology\n\nQualification: BE/BTech in relevant branch with minimum 55% marks. Preference will be given to candidates with ME/MTech or teaching experience.\n\nInterested candidates may submit their resume to the Principal's office or via email to recruitment@gppalanpur.ac.in by 10 February 2026.`,
  },
  {
    id: "ssip-2026",
    slug: "ssip-2026",
    title: "SSIP Grant Approved for Student Projects 2025-26",
    date: "15 Jan 2026",
    isoDate: "2026-01-15",
    category: "scholarship",
    hasDetailPage: true,
    summary: "Student Startup and Innovation Policy (SSIP) grants have been approved for 12 student projects for the year 2025-26.",
    content: `The SSIP Cell at Government Polytechnic Palanpur is pleased to announce that grants have been approved for 12 innovative student projects for the academic year 2025-26. Selected teams will receive financial support of up to ₹50,000 per project for prototype development and research activities. Students whose projects have been shortlisted will be contacted by the SSIP coordinator for further proceedings.`,
  },
  {
    id: "techfest-2026",
    slug: "techfest-2026",
    title: "Annual TechFest INNOVATE 2026 – Registration Open",
    date: "10 Jan 2026",
    isoDate: "2026-01-10",
    category: "event",
    hasDetailPage: true,
    summary: "INNOVATE 2026, the annual technical festival of GP Palanpur, is scheduled for February 2026. Register your team now.",
    content: `Government Polytechnic Palanpur is excited to announce INNOVATE 2026 – our Annual Technical Festival scheduled for February 14-15, 2026.\n\nEvents include:\n- Project Exhibition & Competition\n- Paper Presentation\n- Technical Quiz\n- CAD Design Competition\n- Robotics Challenge\n- Coding Competition\n\nRegistration is open for all diploma students from Gujarat. Teams of 2-4 members can register through the college website or the SSIP cell office.`,
  },
  {
    id: "result-sem3-2025",
    slug: "result-sem3-2025",
    title: "GTU Semester 3 Results declared – Winter 2025",
    date: "5 Jan 2026",
    isoDate: "2026-01-05",
    category: "result",
    hasDetailPage: false,
    summary: "GTU has declared the results for Semester 3 Winter 2025 examinations. Students can check results on GTU portal.",
  },
  {
    id: "library-new-books",
    slug: "library-new-books",
    title: "250+ New Books Added to Central Library Collection",
    date: "2 Jan 2026",
    isoDate: "2026-01-02",
    category: "general",
    hasDetailPage: true,
    summary: "The Central Library has added 250+ new books across all engineering branches. Catalogue is now available online.",
    content: `The Central Library of Government Polytechnic Palanpur has added over 250 new books to its collection for the academic year 2025-26. New additions cover all engineering branches including Civil, Mechanical, Electrical, Electronics, ICT, and IT. Additionally, new reference books for GTU curriculum have been procured.\n\nThe updated catalogue is available at the library portal: gpplibrary.blogspot.com. Students can request specific titles through the library in-charge.`,
  },
  {
    id: "holiday-notice-2026",
    slug: "holiday-notice-2026",
    title: "Official Holiday List for 2026 – Approved by Government of Gujarat",
    date: "1 Jan 2026",
    isoDate: "2026-01-01",
    category: "general",
    hasDetailPage: true,
    summary: "The official holiday list for the calendar year 2026 as approved by the Government of Gujarat has been published.",
    content: `The official list of public holidays for the year 2026 as approved by the Government of Gujarat has been published. All students, faculty, and staff are requested to note the dates and plan academic activities accordingly. The holiday list is available at the administrative office and will be updated on the college notice board.`,
  },
];

export function getSortedAnnouncements(): Announcement[] {
  return [...announcements].sort(
    (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
  );
}

export function getAnnouncementBySlug(slug: string): Announcement | undefined {
  return announcements.find((a) => a.slug === slug);
}
