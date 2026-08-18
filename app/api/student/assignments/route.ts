import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Assignment from '@/models/Assignment';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const assignments = await Assignment.find({ batchId }).sort({ createdAt: -1 });
    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { assignmentId, studentId, studentName, studentEmail, submissionUrl, notes } = body;

    if (!assignmentId || !studentId || !submissionUrl) {
      return NextResponse.json(
        { error: 'Assignment ID, Student ID, and Submission URL are required' },
        { status: 400 }
      );
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Server-side check: Check if Due Date has passed
    const dueDateObj = new Date(assignment.dueDate);
    dueDateObj.setHours(23, 59, 59, 999);
    if (new Date() > dueDateObj) {
      return NextResponse.json(
        { error: 'Submission deadline has passed for this assignment' },
        { status: 400 }
      );
    }

    // Check if student already submitted
    const existingIndex = assignment.submissions.findIndex(
      (sub: any) => sub.studentId?.toString() === studentId.toString()
    );

    // Server-side check: Cannot resubmit if already graded
    if (existingIndex > -1 && assignment.submissions[existingIndex].status === 'graded') {
      return NextResponse.json(
        { error: 'This assignment has already been graded by your teacher and cannot be modified.' },
        { status: 400 }
      );
    }

    const submissionData = {
      studentId,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || 'student@tuitionbd.com',
      submissionUrl,
      notes: notes || '',
      submittedAt: new Date(),
      status: 'submitted' as const,
    };

    if (existingIndex > -1) {
      // Update existing submission
      assignment.submissions[existingIndex] = {
        ...assignment.submissions[existingIndex],
        ...submissionData,
      };
    } else {
      // Add new submission
      assignment.submissions.push(submissionData as any);
    }

    await assignment.save();

    return NextResponse.json(
      { message: 'Assignment submitted successfully', assignment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}
