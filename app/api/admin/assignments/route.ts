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
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { batchId, courseId, title, description, totalMarks, dueDate } = body;

    if (!batchId || !title || !description || !dueDate) {
      return NextResponse.json(
        { error: 'Batch ID, title, description, and due date are required' },
        { status: 400 }
      );
    }

    const newAssignment = await Assignment.create({
      batchId,
      courseId,
      title,
      description,
      totalMarks: Number(totalMarks) || 100,
      dueDate: new Date(dueDate),
      submissions: [],
    });

    return NextResponse.json(
      { message: 'Assignment created successfully', assignment: newAssignment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { assignmentId, submissionId, marksObtained, feedback } = body;

    if (!assignmentId || !submissionId) {
      return NextResponse.json(
        { error: 'Assignment ID and Submission ID are required' },
        { status: 400 }
      );
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const submission = (assignment.submissions as any).id(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    submission.marksObtained = Number(marksObtained);
    submission.feedback = feedback || '';
    submission.status = 'graded';

    await assignment.save();

    return NextResponse.json(
      { message: 'Submission graded successfully', assignment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error grading submission:', error);
    return NextResponse.json({ error: 'Failed to grade submission' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    await Assignment.findByIdAndDelete(assignmentId);
    return NextResponse.json({ message: 'Assignment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
