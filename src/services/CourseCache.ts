import { CourseDetails, Module } from '../types';

type CachedCourse = {
  course: CourseDetails;
  modules?: Module[];
  timestamp: number;
};

const TTL_MS = 5 * 60 * 1000; // 5 minutos
const cache = new Map<number, CachedCourse>();

const isFresh = (timestamp: number) => Date.now() - timestamp < TTL_MS;

export const CourseCache = {
  get(courseId: number): CachedCourse | null {
    const entry = cache.get(courseId);
    if (entry && isFresh(entry.timestamp)) {
      return entry;
    }
    if (entry && !isFresh(entry.timestamp)) {
      cache.delete(courseId);
    }
    return null;
  },
  set(courseId: number, data: { course: CourseDetails; modules?: Module[] }) {
    cache.set(courseId, {
      course: data.course,
      modules: data.modules,
      timestamp: Date.now(),
    });
  },
  clear(courseId?: number) {
    if (typeof courseId === 'number') {
      cache.delete(courseId);
    } else {
      cache.clear();
    }
  },
};
