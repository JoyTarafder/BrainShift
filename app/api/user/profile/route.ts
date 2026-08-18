import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  bio: String,
  institution: String,
  designation: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email.toLowerCase().trim() }).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: JSON.parse(JSON.stringify(user)),
    });
  } catch (error: any) {
    console.error('Fetch profile API error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, phone, bio, institution, designation } = body;

    const user = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User account not found' }, { status: 404 });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (institution !== undefined) user.institution = institution.trim();
    if (designation !== undefined) user.designation = designation.trim();

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: JSON.parse(JSON.stringify(user)),
    });
  } catch (error: any) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Error updating profile' }, { status: 500 });
  }
}
