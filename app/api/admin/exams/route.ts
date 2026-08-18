import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Exam from '@/models/Exam';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const exams = await Exam.find({ batchId }).sort({ createdAt: -1 });
    return NextResponse.json({ exams }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      batchId,
      courseId,
      title,
      type,
      description,
      durationMinutes,
      totalMarks,
      passMarks,
      questions,
      examDate,
    } = body;

    if (!batchId || !title) {
      return NextResponse.json({ error: 'Batch ID and Title are required' }, { status: 400 });
    }

    const newExam = await Exam.create({
      batchId,
      courseId,
      title,
      type: type || 'online_mcq',
      description: description || '',
      durationMinutes: Number(durationMinutes) || 30,
      totalMarks: Number(totalMarks) || (questions?.length ? questions.length * 5 : 100),
      passMarks: Number(passMarks) || 40,
      questions: questions || [],
      results: [],
      examDate: examDate ? new Date(examDate) : new Date(),
    });

    return NextResponse.json({ message: 'Exam created successfully', exam: newExam }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { examId, studentId, studentName, studentEmail, score, totalMarks, passed } = body;

    if (!examId || !studentId) {
      return NextResponse.json({ error: 'Exam ID and Student ID are required' }, { status: 400 });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const numScore = Number(score) || 0;
    const numTotal = Number(totalMarks) || exam.totalMarks || 100;
    const isPassed = passed !== undefined ? passed : numScore >= (exam.passMarks || 40);

    if (!exam.results) {
      exam.results = [];
    }

    const existingIndex = exam.results.findIndex(
      (r: any) => r.studentId?.toString() === studentId.toString()
    );

    const resultData = {
      studentId,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || 'student@tuitionbd.com',
      score: numScore,
      totalMarks: numTotal,
      answers: [],
      passed: isPassed,
      takenAt: new Date(),
    };

    if (existingIndex > -1) {
      exam.results[existingIndex] = { ...exam.results[existingIndex], ...resultData };
    } else {
      exam.results.push(resultData as any);
    }

    await exam.save();

    return NextResponse.json({ message: 'Exam mark recorded successfully', exam }, { status: 200 });
  } catch (error: any) {
    console.error('Error recording exam mark:', error);
    return NextResponse.json({ error: 'Failed to record exam mark' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    await Exam.findByIdAndDelete(examId);
    return NextResponse.json({ message: 'Exam deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
