import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  SimpleGrid,
  Badge,
  HStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { InventoryService } from "@/client"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = ["#3182ce", "#00b5d8", "#38a169", "#ed8936", "#d53f8c", "#805ad5"]

const InventoryDashboard = () => {
  const [criticalThreshold, setCriticalThreshold] = useState(5)

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: () => InventoryService.inventorySummary(),
  })

  const { data: rawLowStockData, isLoading: loadingLowStock } = useQuery({
    queryKey: ["inventory-low-stock", criticalThreshold],
    queryFn: () =>
      InventoryService.lowStockItems({ threshold: criticalThreshold }).then(
        (res) => (Array.isArray(res) ? res : []) // ✅ solo usamos si es array
      ),
  })

  if (isLoading) return <Spinner />
  if (!data || !rawLowStockData) return <Text>No data available</Text>

  const categoryData = Object.entries(data.by_category).map(([name, value]) => ({
    name,
    value,
  }))
  const brandData = Object.entries(data.by_brand).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <VStack align="start" spaceY={8} px={6} pt={10}>
      <Heading size="lg">Inventory Overview</Heading>

      {/* Bar Chart: Items by Category */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>
          Items by Category
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Pie + Low Stock */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spaceX={8} spaceY={8} w="100%">
        {/* Pie Chart */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            Items by Brand
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brandData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {brandData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Low Stock Items */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            Low Stock Items
          </Text>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            mb={4}
            onClick={() => setCriticalThreshold((prev) => (prev === 5 ? 2 : 5))}
          >
            {criticalThreshold === 5 ? "Show critical only (<2)" : "Show low stock (<5)"}
          </Button>

          <Box
            maxH="320px"
            overflowY="auto"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="md"
            p={3}
            bg="gray.50"
          >
            {loadingLowStock ? (
              <Spinner />
            ) : rawLowStockData.length > 0 ? (
              <VStack align="stretch" spaceY={3}>
                {rawLowStockData.map((item) => (
                  <Box
                    key={item.id}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    p={3}
                    shadow="sm"
                  >
                    <Text fontWeight="semibold" fontSize="sm" mb={1}>
                      {item.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Category: <strong>{item.category}</strong>
                    </Text>
                    <HStack spaceX={2} mt={1}>
                      <Text fontSize="xs">Stock:</Text>
                      {item.stock === 0 ? (
                        <Badge bgColor="red">Out of stock</Badge>
                      ) : item.stock === 1 ? (
                        <Badge bgColor="orange">Only 1 left</Badge>
                      ) : (
                        <Badge bgColor="yellow">{item.stock} units</Badge>
                      )}
                    </HStack>
                  </Box>

                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.500">
                No low stock items 🎉
              </Text>
            )}
          </Box>
        </Box>

      </SimpleGrid>
    </VStack>
  )
}

export default InventoryDashboard
