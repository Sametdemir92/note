import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    try {
        const notes = await prisma.note.findMany({
            where: {
                // @ts-ignore
                userId: session.user.id,
                OR: [
                    { title: { contains: search } }, // removed mode: 'insensitive' for sqlite compatibility if needed, but prisma sqlite supports it? No, sqlite contains is case-insensitive by default only for ASCII?
                    { content: { contains: search } },
                ],
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        return NextResponse.json(notes)
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { title, content } = await req.json()

        const note = await prisma.note.create({
            data: {
                title,
                content,
                // @ts-ignore
                userId: session.user.id,
            },
        })

        return NextResponse.json(note, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
