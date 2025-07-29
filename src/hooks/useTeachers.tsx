'use client';

import { useCallback, useMemo, useState } from 'react';

import { TeacherData } from '../components/teachers/teacher-card';

// Mock teacher data
const mockTeachers: TeacherData[] = [
  {
    id: '1',
    name: 'Maria Rodriguez',
    avatar: '/placeholder.svg?height=80&width=80',
    languages: ['Spanish', 'English'],
    specialties: ['Grammar', 'Conversation', 'Business Spanish'],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 25,
    location: 'Madrid, Spain',
    timezone: 'CET',
    experience: '5+ years',
    description:
      'Native Spanish speaker with extensive experience teaching business professionals. Specializes in conversational Spanish and grammar fundamentals.',
    availability: 'Available now',
    isOnline: true,
    isFavorite: false,
    completedLessons: 1250,
    responseTime: 'Usually responds in 2 hours',
    calendlyLink: 'https://calendly.com/maria-rodriguez/spanish-lesson',
  },
  {
    id: '2',
    name: 'Jean Dubois',
    avatar: '/placeholder.svg?height=80&width=80',
    languages: ['French', 'English'],
    specialties: ['Pronunciation', 'Literature', 'Exam Prep'],
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 30,
    location: 'Paris, France',
    timezone: 'CET',
    experience: '8+ years',
    description:
      'Certified French teacher with a passion for literature and culture. Helps students achieve fluency through immersive conversation practice.',
    availability: 'Available tomorrow',
    isOnline: false,
    isFavorite: true,
    completedLessons: 890,
    responseTime: 'Usually responds in 1 hour',
    calendlyLink: 'https://calendly.com/jean-dubois/french-lesson',
  },
  {
    id: '3',
    name: 'Yuki Tanaka',
    avatar: '/placeholder.svg?height=80&width=80',
    languages: ['Japanese', 'English'],
    specialties: ['Beginner Friendly', 'JLPT Prep', 'Cultural Context'],
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 28,
    location: 'Tokyo, Japan',
    timezone: 'JST',
    experience: '6+ years',
    description:
      'Patient and encouraging Japanese teacher who makes learning fun. Specializes in helping beginners build confidence in speaking.',
    availability: 'Available now',
    isOnline: true,
    isFavorite: false,
    completedLessons: 2100,
    responseTime: 'Usually responds in 30 minutes',
    calendlyLink: 'https://calendly.com/yuki-tanaka/japanese-lesson',
  },
  {
    id: '4',
    name: 'Alessandro Bianchi',
    avatar: '/placeholder.svg?height=80&width=80',
    languages: ['Italian', 'English'],
    specialties: ['Culture', 'Travel Italian', 'Business'],
    rating: 4.7,
    reviewCount: 203,
    hourlyRate: 22,
    location: 'Rome, Italy',
    timezone: 'CET',
    experience: '4+ years',
    description:
      'Enthusiastic Italian teacher who brings culture and passion to every lesson. Perfect for travelers and business professionals.',
    availability: 'Available in 2 hours',
    isOnline: true,
    isFavorite: false,
    completedLessons: 1680,
    responseTime: 'Usually responds in 1 hour',
    calendlyLink: 'https://calendly.com/alessandro-bianchi/italian-lesson',
  },
  {
    id: '5',
    name: 'Hans Mueller',
    avatar: '/placeholder.svg?height=80&width=80',
    languages: ['German', 'English'],
    specialties: ['Technical German', 'Grammar', 'Certification Prep'],
    rating: 4.8,
    reviewCount: 144,
    hourlyRate: 35,
    location: 'Berlin, Germany',
    timezone: 'CET',
    experience: '7+ years',
    description:
      'Experienced German instructor specializing in technical language and certification preparation. Great for professionals and academics.',
    availability: 'Available now',
    isOnline: true,
    isFavorite: false,
    completedLessons: 1456,
    responseTime: 'Usually responds in 45 minutes',
    calendlyLink: 'https://calendly.com/hans-mueller/german-lesson',
  },
];

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>(mockTeachers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(
    null
  );
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  // Get available languages from teachers
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    teachers.forEach((teacher) => {
      teacher.languages.forEach((language) => languages.add(language));
    });
    return Array.from(languages).sort();
  }, [teachers]);

  // Filter teachers based on search criteria
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.languages.some((lang) =>
          lang.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        teacher.specialties.some((spec) =>
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesLanguage =
        selectedLanguage === 'all' ||
        teacher.languages.includes(selectedLanguage);

      const matchesPrice =
        teacher.hourlyRate >= priceRange[0] &&
        teacher.hourlyRate <= priceRange[1];

      return matchesSearch && matchesLanguage && matchesPrice;
    });
  }, [teachers, searchQuery, selectedLanguage, priceRange]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguage(value);
  }, []);

  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange(value);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setPriceRange([0, 100]);
    setShowFilters(false);
  }, []);

  const refreshTeachers = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch fresh data
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSelectTeacher = useCallback((teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    setIsDetailsPanelOpen(true);
  }, []);

  const handleClosDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(false);
    setSelectedTeacher(null);
  }, []);

  return {
    // Data
    teachers: filteredTeachers,
    availableLanguages,
    isLoading,

    // Filter states
    searchQuery,
    selectedLanguage,
    priceRange,
    showFilters,

    // Teacher details panel
    selectedTeacher,
    isDetailsPanelOpen,

    // Handlers
    handleSearchChange,
    handleLanguageChange,
    handlePriceRangeChange,
    handleToggleFilters,
    handleClearFilters,
    handleSelectTeacher,
    handleClosDetailsPanel,
    refreshTeachers,
  };
};
