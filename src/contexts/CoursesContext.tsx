import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ApiService from '../services/ApiService';
import { Course, Enrollment } from '../types';
import { useAuth } from './AuthContext';

type CoursesCache = {
  data: Course[];
  timestamp: number;
};

interface CoursesContextData {
  courses: Course[];
  enrollments: Enrollment[];
  isLoadingCourses: boolean;
  isRefreshingCourses: boolean;
  isLoadingEnrollments: boolean;
  coursesError: string | null;
  lastCoursesSync: number | null;
  refreshCourses: (force?: boolean) => Promise<Course[]>;
  refreshEnrollments: (force?: boolean) => Promise<Enrollment[]>;
}

const COURSES_CACHE_KEY = '@softsolutions:courses-cache';
const COURSES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ENROLLMENTS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const CoursesContext = createContext<CoursesContextData | undefined>(undefined);

interface CoursesProviderProps {
  children: ReactNode;
}

export const CoursesProvider: React.FC<CoursesProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [lastCoursesSync, setLastCoursesSync] = useState<number | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [isRefreshingCourses, setIsRefreshingCourses] = useState<boolean>(false);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lastEnrollmentsSync, setLastEnrollmentsSync] = useState<number | null>(null);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState<boolean>(false);

  const coursesRef = useRef<Course[]>([]);
  const enrollmentsRef = useRef<Enrollment[]>([]);
  const lastCoursesSyncRef = useRef<number | null>(null);
  const lastEnrollmentsSyncRef = useRef<number | null>(null);

  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  useEffect(() => {
    enrollmentsRef.current = enrollments;
  }, [enrollments]);

  useEffect(() => {
    lastCoursesSyncRef.current = lastCoursesSync;
  }, [lastCoursesSync]);

  useEffect(() => {
    lastEnrollmentsSyncRef.current = lastEnrollmentsSync;
  }, [lastEnrollmentsSync]);

  const loadCachedCourses = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(COURSES_CACHE_KEY);
      if (!cached) {
        return;
      }

      const parsed: CoursesCache = JSON.parse(cached);
      if (Array.isArray(parsed?.data)) {
        setCourses(parsed.data);
        setLastCoursesSync(parsed.timestamp ?? null);
      }
    } catch (error) {
      console.warn('Erro ao restaurar cache de cursos:', error);
    }
  }, []);

  const refreshCourses = useCallback(async (force = false): Promise<Course[]> => {
    const currentCourses = coursesRef.current;
    const lastSync = lastCoursesSyncRef.current;
    const shouldSkip =
      !force &&
      lastSync !== null &&
      Date.now() - lastSync < COURSES_CACHE_TTL &&
      currentCourses.length > 0;

    if (shouldSkip) {
      return currentCourses;
    }

    const isInitialRequest = currentCourses.length === 0;
    if (isInitialRequest) {
      setIsLoadingCourses(true);
    } else {
      setIsRefreshingCourses(true);
    }

    try {
      const response = await ApiService.listarCursos();
      setCourses(response);
      setCoursesError(null);
      const timestamp = Date.now();
      setLastCoursesSync(timestamp);
      await AsyncStorage.setItem(
        COURSES_CACHE_KEY,
        JSON.stringify({ data: response, timestamp }),
      );
      return response;
    } catch (error: any) {
      const message =
        error?.message || 'Não foi possível atualizar a lista de cursos agora.';
      setCoursesError(message);
      console.error('Erro ao atualizar cursos:', error);
      return coursesRef.current;
    } finally {
      setIsLoadingCourses(false);
      setIsRefreshingCourses(false);
    }
  }, []);

  const refreshEnrollments = useCallback(
    async (force = false): Promise<Enrollment[]> => {
      if (!isAuthenticated) {
        setEnrollments([]);
        setLastEnrollmentsSync(null);
        return [];
      }

      const currentEnrollments = enrollmentsRef.current;

      const lastSync = lastEnrollmentsSyncRef.current;
      const shouldSkip =
        !force &&
        lastSync !== null &&
        Date.now() - lastSync < ENROLLMENTS_CACHE_TTL &&
        currentEnrollments.length > 0;

      if (shouldSkip) {
        return currentEnrollments;
      }

      if (currentEnrollments.length === 0) {
        setIsLoadingEnrollments(true);
      }

      try {
        const response = await ApiService.listarInscricoesUsuario();
        setEnrollments(response);
        setLastEnrollmentsSync(Date.now());
        return response;
      } catch (error) {
        console.error('Erro ao atualizar inscrições:', error);
        return enrollmentsRef.current;
      } finally {
        setIsLoadingEnrollments(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    loadCachedCourses();
  }, [loadCachedCourses]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshEnrollments(true);
    } else {
      setEnrollments([]);
      setLastEnrollmentsSync(null);
    }
  }, [isAuthenticated, refreshEnrollments]);

  const value: CoursesContextData = {
    courses,
    enrollments,
    isLoadingCourses,
    isRefreshingCourses,
    isLoadingEnrollments,
    coursesError,
    lastCoursesSync,
    refreshCourses,
    refreshEnrollments,
  };

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};

export const useCourses = (): CoursesContextData => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses deve ser usado dentro de um CoursesProvider');
  }
  return context;
};
