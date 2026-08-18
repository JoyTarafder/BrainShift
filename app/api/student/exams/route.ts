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
    console.error('Error fetching student exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { examId, studentId, studentName, studentEmail, answers, submissionUrl, notes } = body;

    if (!examId || !studentId) {
      return NextResponse.json({ error: 'Exam ID and Student ID are required' }, { status: 400 });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (!exam.results) {
      exam.results = [];
    }

    const existingIndex = exam.results.findIndex(
      (r: any) => r.studentId?.toString() === studentId.toString()
    );
    const existingSub = existingIndex > -1 ? exam.results[existingIndex] : null;

    let score = existingSub ? existingSub.score : 0;
    let passed = existingSub ? existingSub.passed : false;
    let finalAnswers = Array.isArray(answers) ? answers : existingSub?.answers || [];

    if (exam.type === 'online_mcq') {
      if (!Array.isArray(answers)) {
        return NextResponse.json({ error: 'Answers array is required for online MCQ exam' }, { status: 400 });
      }
      score = 0;
      const questions = exam.questions || [];
      const marksPerQuestion = questions.length > 0 ? Math.round(exam.totalMarks / questions.length) : 0;

      questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correctOption) {
          score += marksPerQuestion;
        }
      });

      score = Math.min(exam.totalMarks, score);
      passed = score >= (exam.passMarks || 40);
    }

    const resultData = {
      studentId,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || 'student@tuitionbd.com',
      score,
      totalMarks: exam.totalMarks,
      answers: finalAnswers,
      submissionUrl: submissionUrl || existingSub?.submissionUrl || '',
      notes: notes || existingSub?.notes || '',
      passed,
      takenAt: new Date(),
    };

    if (existingIndex > -1) {
      exam.results[existingIndex] = { ...exam.results[existingIndex], ...resultData };
    } else {
      exam.results.push(resultData as any);
    }

    await exam.save();

    return NextResponse.json(
      {
        message: 'Exam submitted successfully',
        score,
        totalMarks: exam.totalMarks,
        passed,
        result: resultData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}
