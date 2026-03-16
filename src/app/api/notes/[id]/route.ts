import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { title, content } = await req.json()
        const { id } = await params

        // Verify ownership
        const existingNote = await prisma.note.findUnique({
            where: { id },
        })

        if (!existingNote) {
            return NextResponse.json({ message: "Note not found" }, { status: 404 })
        }

        // @ts-expect-error session.user is typed generically
        if (existingNote.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const note = await prisma.note.update({
            where: { id },
            data: {
                title,
                content,
            },
        })

        return NextResponse.json(note)
    } catch {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        // Verify ownership
        const existingNote = await prisma.note.findUnique({
            where: { id },
        })

        if (!existingNote) {
            return NextResponse.json({ message: "Note not found" }, { status: 404 })
        }

        // @ts-expect-error session.user is typed generically
        if (existingNote.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        await prisma.note.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Note deleted" })
    } catch {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
