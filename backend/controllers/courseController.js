import Course from '../models/Course.js';

// @desc    Get published courses (Public)
// @route   GET /api/courses
export const getCourses = async (req, res) => {
  try {
    const { subject, level, search } = req.query;
    const query = { status: 'published' };

    if (subject && subject !== 'All') query.subject = subject;
    if (level && level !== 'All') query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching courses',
    });
  }
};

// @desc    Get ALL courses including draft/archived (Admin Only)
// @route   GET /api/courses/admin/all
export const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching admin courses',
    });
  }
};

// @desc    Get single course by slug (Public)
// @route   GET /api/courses/:slug
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching course details',
    });
  }
};

// @desc    Get single course by ID (Admin)
// @route   GET /api/courses/id/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create a new course (Admin Only)
// @route   POST /api/courses
export const createCourse = async (req, res) => {
  try {
    const { title, slug, description, shortDescription, subject, level, price, thumbnailUrl, duration, syllabus, modules, status } = req.body;

    if (!title || !slug || !description || !shortDescription || !subject || !price || !thumbnailUrl || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const courseExists = await Course.findOne({ slug });
    if (courseExists) {
      return res.status(400).json({ success: false, message: 'Course slug already exists' });
    }

    const course = await Course.create({
      title,
      slug: slug.toLowerCase(),
      description,
      shortDescription,
      subject,
      level: level || 'Beginner',
      price: Number(price),
      thumbnailUrl,
      duration,
      syllabus: syllabus || [],
      modules: modules || [],
      status: status || 'published',
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error creating course' });
  }
};

// @desc    Update an existing course (Admin Only)
// @route   PUT /api/courses/:id
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating course' });
  }
};

// @desc    Archive / Delete a course (Admin Only)
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Soft delete: set status to archived
    course.status = 'archived';
    await course.save();

    res.status(200).json({ success: true, message: 'Course archived successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error archiving course' });
  }
};
