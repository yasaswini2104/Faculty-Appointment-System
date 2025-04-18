
export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  specialization: string;
  bio: string;
  profileImageUrl?: string;
}

export const facultyMembers: FacultyMember[] = [
  {
    id: '2', // Matches the ID in AuthContext for Jane Faculty
    name: 'Dr. Jane Faculty',
    email: 'faculty@university.edu',
    department: 'Computer Science',
    title: 'Associate Professor',
    specialization: 'Artificial Intelligence',
    bio: 'Dr. Faculty specializes in artificial intelligence and machine learning, with a focus on neural networks and deep learning applications.',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/42.jpg'
  },
  {
    id: '4',
    name: 'Dr. Robert Smith',
    email: 'robert.smith@university.edu',
    department: 'Physics',
    title: 'Professor',
    specialization: 'Quantum Physics',
    bio: 'Dr. Smith has been researching quantum mechanics for over 20 years with a particular interest in quantum computing applications.',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '5',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Mathematics',
    title: 'Assistant Professor',
    specialization: 'Applied Mathematics',
    bio: 'Dr. Johnson focuses on mathematical modeling and numerical analysis, with applications in climate science and environmental systems.',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: '6',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Computer Science',
    title: 'Associate Professor',
    specialization: 'Cybersecurity',
    bio: 'Dr. Chen researches advanced security protocols and cryptographic systems for protecting critical infrastructure.',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/42.jpg'
  },
  {
    id: '7',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@university.edu',
    department: 'Engineering',
    title: 'Professor',
    specialization: 'Biomedical Engineering',
    bio: 'Dr. Rodriguez specializes in designing advanced prosthetics and medical devices using cutting-edge materials and technologies.',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/22.jpg'
  },
  {
    id: '8',
    name: 'Dr. David Kim',
    email: 'david.kim@university.edu',
    department: 'Chemistry',
    title: 'Professor',
    specialization: 'Organic Chemistry',
    bio: 'Dr. Kim conducts research on synthetic organic chemistry with applications in pharmaceutical development.',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: '9',
    name: 'Dr. Lisa Patel',
    email: 'lisa.patel@university.edu',
    department: 'Psychology',
    title: 'Assistant Professor',
    specialization: 'Cognitive Psychology',
    bio: 'Dr. Patel studies cognitive processes including memory, perception, and decision-making in both laboratory and real-world settings.',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/62.jpg'
  },
  {
    id: '10',
    name: 'Dr. James Wilson',
    email: 'james.wilson@university.edu',
    department: 'Business',
    title: 'Associate Professor',
    specialization: 'Organizational Behavior',
    bio: 'Dr. Wilson researches team dynamics, leadership, and workplace motivation in both traditional and remote work settings.',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/62.jpg'
  }
];

export const getDepartments = (): string[] => {
  const departments = facultyMembers.map(faculty => faculty.department);
  return [...new Set(departments)]; // Remove duplicates
};

export const getFacultyByDepartment = (department: string): FacultyMember[] => {
  return facultyMembers.filter(faculty => faculty.department === department);
};

export const getFacultyById = (id: string): FacultyMember | undefined => {
  return facultyMembers.find(faculty => faculty.id === id);
};

export const searchFaculty = (query: string): FacultyMember[] => {
  const lowercaseQuery = query.toLowerCase();
  return facultyMembers.filter(faculty => 
    faculty.name.toLowerCase().includes(lowercaseQuery) ||
    faculty.department.toLowerCase().includes(lowercaseQuery) ||
    faculty.specialization.toLowerCase().includes(lowercaseQuery)
  );
};
