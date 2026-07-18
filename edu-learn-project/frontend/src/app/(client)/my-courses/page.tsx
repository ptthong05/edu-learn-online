'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';
import CourseCard from '@/components/client/course/CourseCard';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyCourses()
      .then(res => {
        const sorted = (res || []).sort((a: any, b: any) => {
          return new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime();
        });
        setCourses(sorted);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Khóa học đã mua của tôi</h1>
        
        {loading ? (
          <p className="text-gray-500">Đang tải danh sách khóa học...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">Bạn chưa sở hữu khóa học nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
