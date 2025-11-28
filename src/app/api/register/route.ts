import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { userSchema } from "@/lib/validations"

export async function POST(req: Request) {
    try {
        const json = await req.json()
        const parseResult = userSchema.safeParse(json)
        if (!parseResult.success) {
            return NextResponse.json({ message: "Invalid input", errors: parseResult.error.format() }, { status: 400 })
        }
        const { email, password, name } = parseResult.data

        // Email and password are already validated by Zod, but keep check for safety
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        })

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email, name: user.name } },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ message: "Something went wrong", error: String(error) }, { status: 500 })
    }
}
