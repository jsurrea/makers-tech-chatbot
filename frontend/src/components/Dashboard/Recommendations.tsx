import {
  Box,
  Heading,
  Spinner,
  Text,
  SimpleGrid,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import ProductCard from "@/components/Common/ProductCard"
import { RecommendationsService } from "@/client"

const labelStyles = {
  highly_recommended: { color: "green.600", fontWeight: "bold", fontSize: "lg" },
  recommended: { color: "blue.600", fontWeight: "medium", fontSize: "md" },
  not_recommended: { color: "gray.500", fontSize: "sm" },
}

const Recommendations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => RecommendationsService.getRecommendations(),
  })

  if (isLoading) return <Spinner />

  return (
    <Box>
      <Heading size="md" mb={4}>
        Recommended for You
      </Heading>

      {Object.entries(data || {}).map(([group, items]) => (
        <Box key={group} mb={6}>
          <Text fontWeight="bold" textTransform="capitalize" {...(labelStyles as any)[group]} mb={2}>
            {group.replace(/_/g, " ")}
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spaceX={4}>
            {items.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  )
}

export default Recommendations
