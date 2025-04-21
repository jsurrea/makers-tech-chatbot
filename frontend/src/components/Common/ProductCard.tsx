import {
  Box,
  Text,
  Heading,
  Badge,
  HStack,
  VStack,
  Image,
  Stack,
} from "@chakra-ui/react"
import type { Item } from "@/client"
import { Button } from "../ui/button"

type Props = {
  product: Item
}

const ProductCard = ({ product }: Props) => {
  const {
    title,
    brand,
    model,
    price,
    discount,
    image,
    category,
    stock,
    description,
  } = product

  const finalPrice = discount
    ? price * (1 - discount / 100)
    : price

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={3}
      shadow="xs"
      w="100%"
      h="400px"
      maxW="xs"
      minW="220px"
      bg="white"
    >
      <Image
        src={`https://picsum.photos/seed/${encodeURIComponent(title.slice(0, 10))}/300/200`}
        alt={title}
        objectFit="cover"
        borderRadius="md"
        mb={2}
        w="100%"
        h="120px"
      />
      <VStack align="start" spaceY={1}>
        <Text fontWeight="semibold" fontSize="sm" lineClamp={3}>
          {title}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {brand.toUpperCase()}{model ? ` – ${model}` : ""}
        </Text>
        <Badge colorScheme="blue">{category}</Badge>
        <Text fontSize="xs" color="gray.500">
          {stock > 0 ? `In stock (${stock})` : "Out of stock"}
        </Text>
        <HStack spaceX={2}>
          <Text fontWeight="bold" fontSize="sm">
            ${finalPrice.toFixed(2)}
          </Text>
          {discount && (
            <>
              <Text as="s" fontSize="xs" color="gray.400">
                ${price.toFixed(2)}
              </Text>
              <Badge colorScheme="pink" fontSize="0.6em">
                {discount}% OFF
              </Badge>
            </>
          )}
        </HStack>
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          mt={2}
          onClick={() => {
            console.log("Interested in:", product.title)
          }}
        >
          I'm interested
        </Button>
      </VStack>
    </Box>

  )
}

export default ProductCard
