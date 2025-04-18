import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import FacultyList from '@/components/faculty/FacultyList';
import { getDepartments, facultyMembers, FacultyMember } from '@/data/facultyData';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import { facultyService } from '@/lib/api';

const FacultyDirectoryPage: React.FC = () => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>(facultyMembers);

  useEffect(() => {
    const loadData = async () => {
      try {
        const backendFaculty: FacultyMember[] = await facultyService.getAllFaculty();
        setFaculty(backendFaculty);

        const deptSet = new Set(backendFaculty.map((f) => f.department));
        setDepartments(['all', ...Array.from(deptSet)]);
      } catch (error) {
        console.error('Fallback to static data due to error:', error);
        setDepartments(['all', ...getDepartments()]);
      }
    };

    loadData();
  }, []);

  // 🔐 Redirect placed **after** hooks
  if (!user) return <Navigate to="/login" />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="heading-1">Faculty Directory</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center">
                <Search className="h-4 w-4 mr-1" />
                <span>Search Faculty</span>
              </Label>
              <Input
                id="search"
                placeholder="Search by name, department, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span>Filter by Department</span>
              </Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <FacultyList
          facultyData={faculty}
          filter={{
            department: selectedDepartment === 'all' ? '' : selectedDepartment,
            searchQuery
          }}
        />
      </div>
    </MainLayout>
  );
};

export default FacultyDirectoryPage;
