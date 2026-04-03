import NextAuth from "next-auth";

// Edge-safe auth config — no Prisma, no Node.js modules
// Only used in proxy.ts for route protection
export const { auth } = NextAuth({
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (token.id) session.user.id = token.id as string;
            return session;
        },
    },
    pages: { signIn: "/auth/signin" },
    session: { strategy: "jwt" },
});
