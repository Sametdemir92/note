import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations"
import { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const parseResult = loginSchema.safeParse(credentials ?? {});
                if (!parseResult.success) {
                    return null;
                }
                const { email, password } = parseResult.data;
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    return null;
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return null;
                }
                return { id: user.id, email: user.email, name: user.name };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-expect-error
                session.user.id = token.sub;
            }
            return session;
        }
    },

    debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
