"use client"

import { useState, useEffect } from "react"
import { Note } from "@prisma/client"

interface NoteEditorProps {
    note: Note | null
    onSave: () => void
}

export default function NoteEditor({ note, onSave }: NoteEditorProps) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (note) {
            setTitle(note.title)
            setContent(note.content)
        } else {
            setTitle("")
            setContent("")
        }
    }, [note])

    const handleSave = async () => {
        setSaving(true)
        try {
            const method = note ? "PUT" : "POST"
            const url = note ? `/api/notes/${note.id}` : "/api/notes"

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content }),
            })

            if (res.ok) {
                onSave()
                if (!note) {
                    setTitle("")
                    setContent("")
                }
            }
        } catch (error) {
            console.error("Failed to save note", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!note || !confirm("Are you sure you want to delete this note?")) return

        try {
            const res = await fetch(`/api/notes/${note.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                onSave()
            }
        } catch (error) {
            console.error("Failed to delete note", error)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Note Title"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-xl font-semibold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex gap-2">
                    {note && (
                        <button
                            onClick={handleDelete}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
            <div className="flex-1 p-4">
                <textarea
                    className="block w-full h-full resize-none border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Start writing..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
        </div>
    )
}
