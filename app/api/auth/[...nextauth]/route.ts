import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@tutornova.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        const emailClean = credentials.email.toLowerCase().trim();

        // 1. Try Express backend API first
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailClean,
              password: credentials.password,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              if (data.user.status === 'blocked') {
                throw new Error('Your account is blocked. Please contact support.');
              }
              return {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                token: data.token,
              };
            }
          }
        } catch (expressErr: any) {
          if (expressErr.message?.includes('blocked')) {
            throw expressErr;
          }
          console.warn('Express Auth backend unreachable, attempting direct database auth:', expressErr);
        }

        // 2. Direct MongoDB Atlas authentication fallback
        let user = null;
        try {
          await connectToDatabase();
          user = await User.findOne({ email: emailClean });
        } catch (dbErr: any) {
          console.error('Database Connection Error during auth:', dbErr);
          throw new Error('Database connection failed. Please try again.');
        }

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          if (user.status === 'blocked') {
            throw new Error('Your account has been blocked. Please contact administrator.');
          }
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.apiToken = (user as any).token;
        token.id = user.id;
        token.name = user.name;
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.user?.name) token.name = session.user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).apiToken = token.apiToken;
        (session.user as any).id = token.id;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'tutornova_super_secret_jwt_key_2026',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
