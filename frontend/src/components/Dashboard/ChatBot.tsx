import {
  Box,
  Button,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { ChatService, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

type Message = {
  role: "user" | "assistant"
  content: string
}

const ChatBot = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const { showErrorToast } = useCustomToast()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await (await UsersService.readUserMe()).chat_history
        if (!history) return
        setMessages(
          history.map((msg: any) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }))
        )
      } catch (err) {
        showErrorToast("Failed to load chat history.")
      }
    }

    fetchHistory()
  }, [])


  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages: Message[] = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")

    try {
      const response = await ChatService.chat({ requestBody: { message: input } })
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.reply },
      ])
    } catch (err) {
      showErrorToast("Failed to send message.")
    }
  }

  return (
    <Box>
      <Text fontSize="lg" mb={2}>
        Ask our assistant
      </Text>
      <VStack align="stretch" spaceX={2} spaceY={2} mb={4} maxH="300px" overflowY="auto">
        {messages.map((msg, i) => (
          <Box
            key={i}
            bg={msg.role === "user" ? "gray.100" : "blue.50"}
            p={2}
            borderRadius="md"
            alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
          >
            <Text>{msg.content}</Text>
          </Box>
        ))}
      </VStack>

      <Input
        placeholder="Type a message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage()
        }}
      />
      <Button onClick={sendMessage} mt={2}>
        Send
      </Button>
    </Box>
  )
}

export default ChatBot
