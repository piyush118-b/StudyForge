// Subject defaults mapping based on user stream selection
export const DEFAULT_SUBJECTS: Record<string, string[]> = {
  "CSE / IT": [
    "Data Structures & Algorithms", "Operating Systems", "Database Management Systems (DBMS)",
    "Computer Networks", "Object-Oriented Programming (OOP)", "Software Engineering",
    "Theory of Computation (TOC)", "Compiler Design", "Computer Architecture & Organization",
    "Discrete Mathematics", "Linear Algebra & Calculus", "Probability & Statistics",
    "Web Development", "Mobile App Development", "Machine Learning", "Artificial Intelligence",
    "Deep Learning", "Natural Language Processing", "Cloud Computing", "Cyber Security",
    "Data Science", "Big Data Analytics", "Information Security", "Design & Analysis of Algorithms",
    "Digital Logic Design", "Microprocessors & Microcontrollers", "Python Programming",
    "Java Programming", "C / C++ Programming", "Data Warehousing & Mining",
    "Software Testing", "Human-Computer Interaction (HCI)", "Distributed Systems",
    "Internet of Things (IoT)", "Blockchain Technology", "DevOps", "System Design",
    "Numerical Methods", "Environmental Studies (EVS)", "Professional Ethics",
    "Communication Skills / Technical Writing", "Minor Project", "Major Project", "Seminar"
  ],
  "ECE / EE": [
    "Circuit Theory & Networks", "Electronic Devices & Circuits", "Signals & Systems",
    "Analog Electronics", "Digital Electronics", "Electromagnetic Theory (EMT)",
    "Control Systems", "Communication Systems", "Microprocessors & Embedded Systems",
    "VLSI Design", "Power Systems", "Power Electronics", "Electric Machines",
    "Digital Signal Processing (DSP)", "Antenna & Wave Propagation", "Optical Fiber Communication",
    "Wireless Communication", "RF & Microwave Engineering", "PCB Design",
    "Mathematics (Transform Techniques, Probability)", "Engineering Physics",
    "Environmental Studies", "Mini Project", "Main Project"
  ],
  "Mechanical": [
    "Engineering Mechanics", "Thermodynamics", "Fluid Mechanics", "Heat Transfer",
    "Manufacturing Processes", "Strength of Materials (SOM)", "Machine Design",
    "Theory of Machines", "Metrology & Quality Control", "Industrial Engineering",
    "Automobile Engineering", "CAD/CAM", "Finite Element Analysis (FEA)",
    "Refrigeration & Air Conditioning", "Hydraulics & Pneumatics", "Operations Research",
    "Engineering Drawing", "Material Science", "Environmental Studies", "Project Work"
  ],
  "Civil": [
    "Engineering Mechanics", "Structural Analysis", "RCC Design", "Steel Structure Design",
    "Geotechnical Engineering (Soil Mechanics)", "Fluid Mechanics & Hydraulics",
    "Environmental Engineering", "Transportation Engineering", "Surveying",
    "Construction Materials & Technology", "Estimating & Costing", "Project Management",
    "Building Planning & Drawing", "Hydrology", "Foundation Engineering", "GIS & Remote Sensing"
  ],
  "Commerce / Business": [
    "Financial Accounting", "Cost Accounting", "Business Economics", "Business Mathematics & Statistics",
    "Organizational Behavior", "Marketing Management", "Financial Management", "Human Resource Management",
    "Business Law / Corporate Law", "Income Tax & GST", "Auditing", "Management Accounting",
    "Strategic Management", "Operations Management", "Entrepreneurship Development",
    "Business Communication", "E-Commerce", "Business Ethics & CSR", "Research Methodology",
    "International Business", "Banking & Finance", "Supply Chain Management", "Project Work"
  ],
  "Science": [
    "Calculus & Differential Equations", "Linear Algebra", "Real Analysis", "Statistics & Probability",
    "Classical Mechanics", "Electrodynamics", "Quantum Mechanics", "Thermodynamics", "Optics",
    "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry",
    "Cell Biology", "Genetics", "Microbiology", "Ecology & Environment", "Zoology", "Botany",
    "Computer Science (BCA/BSc CS)", "Data Structures", "Database Systems", "Operating Systems"
  ],
  "Arts / Humanities": [
    "Literature (English / Hindi / Regional)", "History of India", "Modern World History",
    "Political Theory", "Indian Constitution & Polity", "Sociology Concepts & Theories",
    "Introduction to Psychology", "Research Methodology", "Media & Communication",
    "Indian Economy", "Microeconomics", "Macroeconomics", "Philosophy", "Ethics", "Geography"
  ]
};

// Help map specific string exacts from constants.ts branches into the broader category keys above
export const mapBranchToCategory = (branch: string): string => {
  if (branch.includes("CSE") || branch.includes("Computer") || branch.includes("IT") || branch.includes("Software")) return "CSE / IT";
  if (branch.includes("ECE") || branch.includes("Electrical") || branch.includes("Electronics")) return "ECE / EE";
  if (branch.includes("Mechanical") || branch.includes("Aerospace") || branch.includes("Automobile")) return "Mechanical";
  if (branch.includes("Civil")) return "Civil";
  if (branch.includes("B.Com") || branch.includes("MBA") || branch.includes("BBA") || branch.includes("Commerce") || branch.includes("Finance")) return "Commerce / Business";
  if (branch.includes("B.Sc") || branch.includes("Science")) return "Science";
  if (branch.includes("BA") || branch.includes("Arts") || branch.includes("Humanities") || branch.includes("Design")) return "Arts / Humanities";
  return "CSE / IT"; // Fallback to IT
};

// Step 1 Options
export const SUBJECT_TYPES = ["Lecture", "Lab / Practical", "Tutorial", "Project-based", "Revision-heavy", "Exam-heavy"];

// Step 3 Fixed Commitments categories
export const COMMITMENT_TYPES = ["College Classes", "Tuition / Coaching", "Sleep", "Meals", "Gym / Exercise", "Part-time Job", "Family Responsibilities", "Commute", "Prayer / Religious", "Club / Extracurricular", "Screen Time", "Other"];

// Step 4 Energy Options
export const CHRONOTYPES = ["Morning Person", "Night Owl", "Flexible"];
export const PEAK_WINDOWS = ["6 AM – 10 AM", "10 AM – 2 PM", "2 PM – 6 PM", "6 PM – 10 PM", "After 10 PM"];
export const BREAK_FREQUENCIES = ["Minimal", "Normal", "Frequent"];
export const BREAK_LENGTHS = ["10 min", "15 min", "20–30 min", "Custom"];
export const SESSION_LENGTHS = ["25 min", "45 min", "60 min", "90 min", "2 hrs", "Depends"];

// Step 5 Goals & Constraints 
export const GOAL_OPTIONS = [
  "Score 8+ CGPA", "Score 9+ CGPA (topper mode)", "Prepare for GATE", 
  "Prepare for campus placements", "Balance studies + health + life", 
  "Finish all assignments on time", "Improve specific weak subjects",
  "Reduce stress & avoid last-minute panic", "Build projects / portfolio",
  "Learn skills outside curriculum (DSA, dev, etc.)", "Prepare for higher studies / GRE / GMAT / IELTS"
];

// Step 6 Smart Prefs
export const LEARNING_STYLES = ["Visual", "Auditory", "Reading / Writing", "Hands-on / Practical", "Mix"];
export const REVISION_FREQUENCIES = ["Daily light review", "Every 2 days", "Weekly deep revision", "Smart (AI decides)"];
export const TIMETABLE_FORMATS = ["Day-by-day", "Subject-wise", "Hour-by-hour", "Combined"];
