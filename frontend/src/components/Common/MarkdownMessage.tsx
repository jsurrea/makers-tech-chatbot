import ReactMarkdown from "react-markdown"
import { chakra } from "@chakra-ui/react"

const ChakraP = chakra("p")
const ChakraUl = chakra("ul")
const ChakraLi = chakra("li")
const ChakraStrong = chakra("strong")

type Props = {
  content: string
}

const MarkdownMessage = ({ content }: Props) => {
  return (
    <ReactMarkdown
      components={{
        p: (props) => <ChakraP mb={2} {...props} />,
        strong: (props) => <ChakraStrong fontWeight="bold" {...props} />,
        ul: (props) => <ChakraUl pl={4} {...props} />,
        li: (props) => <ChakraLi ml={4} listStyleType="disc" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownMessage
