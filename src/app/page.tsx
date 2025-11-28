"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import NoteList from "@/components/NoteList"
import NoteEditor from "@/components/NoteEditor"
import { Note } from "@prisma/client"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const handleNoteSelect = (note: Note | null) => {
    setSelectedNote(note)
  }

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1)
    // If it was a new note, we might want to select it or just refresh list
    // For simplicity, we just refresh list and keep current selection if it was edit, or clear if it was new?
    // Actually NoteEditor handles clearing if new.
  }

  return (
    <main className="flex h-screen bg-gray-100 overflow-hidden">
      <NoteList
        onSelectNote={handleNoteSelect}
        selectedNoteId={selectedNote?.id}
        refreshTrigger={refreshTrigger}
      />
      <NoteEditor
        note={selectedNote}
        onSave={handleSave}
      />
    </main>
  )
}
