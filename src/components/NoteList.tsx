"use client"

import { useState, useEffect } from "react"
import { type Note } from "@prisma/client"
import { signOut } from "next-auth/react"

interface NoteListProps {
    onSelectNote: (note: Note | null) => void
    selectedNoteId?: string
    refreshTrigger: number
}

export default function NoteList({ onSelectNote, selectedNoteId, refreshTrigger }: NoteListProps) {
    const [notes, setNotes] = useState<Note[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch(`/api/notes?search=${search}`)
                if (res.ok) {
                    const data = await res.json()
                    setNotes(data)
                }
            } catch (error) {
                console.error("Failed to fetch notes", error)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(() => {
            fetchNotes()
        }, 300) // Debounce search

        return () => clearTimeout(timeoutId)
    }, [search, refreshTrigger])

    return (
        <div className="w-1/3 border-r border-gray-200 bg-white h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">My Notes</h2>
                    <button
                        onClick={() => signOut()}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Logout
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search notes..."
                    className="w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={() => onSelectNote(null)}
                    className="mt-3 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    New Note
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notes.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notes found</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notes.map((note) => (
                            <li
                                key={note.id}
                                className={`cursor-pointer hover:bg-gray-50 p-4 ${selectedNoteId === note.id ? "bg-indigo-50 hover:bg-indigo-50" : ""
                                    }`}
                                onClick={() => onSelectNote(note)}
                            >
                                <div className="flex justify-between gap-x-6">
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-gray-900 truncate">
                                            {note.title || "Untitled Note"}
                                        </p>
                                        <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                            {note.content.substring(0, 50)}...
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                                        <p className="text-xs leading-5 text-gray-500">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
