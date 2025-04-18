import React from 'react';
import { Link } from 'react-router-dom';
import { FacultyMember } from '@/data/facultyData'; // interface only
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FacultyListProps {
  facultyData: FacultyMember[];
  filter?: {
    department?: string;
    searchQuery?: string;
  };
}

const FacultyList: React.FC<FacultyListProps> = ({ facultyData, filter }) => {
  const filteredFaculty = facultyData.filter((faculty) => {
    if (filter?.department && faculty.department !== filter.department) return false;

    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        faculty.name.toLowerCase().includes(query) ||
        faculty.department.toLowerCase().includes(query) ||
        faculty.specialization.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  if (filteredFaculty.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No faculty members found</h3>
        <p className="text-muted-foreground">
          Try changing your search criteria or department filter
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFaculty.map((faculty) => (
        <Card key={faculty.id || faculty.email || faculty.name} className="overflow-hidden">
          <div className="h-24 bg-university-blue"></div>
          <CardContent className="pt-0">
            <div className="flex justify-center -mt-12 mb-4">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={faculty.profileImageUrl} alt={faculty.name} />
                <AvatarFallback className="text-xl bg-university-lightBlue text-white">
                  {getInitials(faculty.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">{faculty.name}</h3>
              <p className="text-university-blue">{faculty.title}</p>
              <div className="flex items-center justify-center mt-1">
                <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{faculty.department}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Specialization</h4>
                <p className="text-sm text-muted-foreground">{faculty.specialization}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  {faculty.department}
                </Badge>
                <Badge variant="outline" className="bg-muted/50">
                {(faculty.specialization ?? 'N/A').split(' ')[0]}
                </Badge>
              </div>

              <Link to={`/faculty/${faculty.id}`} className="block">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FacultyList;
