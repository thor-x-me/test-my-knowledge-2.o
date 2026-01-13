import React, { useMemo, useRef, useState, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
}

const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', role: 'ai', content: 'Hi! I\'m Yuki. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    // simple mocked AI reply for now
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'ai', content: `You said: "${trimmed}"` }
      ])
    }, 400)
  }

  const placeholder = useMemo(() => 'Type your message...', [])

  return (
    <div className='bg-white rounded-2xl p-1 min-h-full h-[78vh] flex flex-col border-3 border-black'>
      <div ref={scrollRef} className='flex-1 overflow-y-auto px-4 py-3 space-y-3'>
        {messages.map(m => (
          <div key={m.id} className={`w-full flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#a8cce7] text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className=' px-3 py-2'>
        <div className='flex items-center gap-2 rounded-full border-gray-100 border-1 bg-gray-50 '>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={placeholder}
            className='flex-1 bg-gray-50  px-3 py-2 outline-none rounded-l-full'
          />
          <button
            onClick={handleSend}
            className='px-2 py-2 rounded-full bg-[#98cff9] text-white disabled:opacity-50 hover:bg-[#5c85a4]'
            disabled={!input.trim()}
          >
            <ArrowUpRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatSection