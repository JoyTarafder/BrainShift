import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let courseUrls: MetadataRoute.Sitemap = [];

  try {
    await connectToDatabase();
    const courses = await Course.find({ status: 'published' }).lean();

    courseUrls = courses.map((course: any) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: new Date(course.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Sitemap DB query error:', err);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  return [...staticPages, ...courseUrls];
}
