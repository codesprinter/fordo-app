import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectMongo from './lib/mongodb';
import User from './models/User';
import Family from './models/Family';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        await connectMongo();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (passwordsMatch) {
          return { id: user._id.toString(), email: user.email, name: user.name, role: user.role, family_id: user.family_id?.toString() };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.family_id = (user as any).family_id;
      }
      
      // Auto-migrate legacy users who don't have a family_id
      if (!token.family_id && token.id) {
        await connectMongo();
        const dbUser = await User.findById(token.id);
        if (dbUser) {
          if (!dbUser.family_id) {
            const newFamily = await Family.create({ name: `${dbUser.name}'s Family` });
            dbUser.family_id = newFamily._id;
            await dbUser.save();
          }
          token.family_id = dbUser.family_id.toString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.family_id = token.family_id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // custom login page
  }
});
