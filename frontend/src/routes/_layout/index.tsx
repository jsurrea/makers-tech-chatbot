import { Box, Container, Flex, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import useAuth from "@/hooks/useAuth"
import ChatBot from "@/components/Dashboard/ChatBot"
import Recommendations from "@/components/Dashboard/Recommendations"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <Container maxW="full">
      <Box pt={12} m={4}>
        <Text fontSize="2xl" truncate maxW="sm">
          Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
        </Text>
        <Text>Welcome back, nice to see you again!</Text>
      </Box>
      <Flex gap={8} direction={{ base: "column", md: "row" }} px={4} mt={8}>
        <Box flex={3}>
          <Recommendations />
        </Box>
        <Box flex={2} minW="300px" p={4}>
          <ChatBot />
        </Box>
      </Flex>
    </Container>
  )
}
