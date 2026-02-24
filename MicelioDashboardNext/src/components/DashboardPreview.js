

import { useState } from 'react';
import { Box, Flex, Text, Stat, StatLabel, StatNumber, StatHelpText, Button } from '@chakra-ui/react';

console.log('DashboardPreview Loaded');


const DashboardPreview = ({ summaryData }) => {
  return (
    <Flex w="100%" mb={10} justifyContent="space-between" wrap="wrap">
      {summaryData.map((item) => (
        <StatCard key={item.title} title={item.title} value={item.value} description={item.description} />
      ))}
    </Flex>
  );
};

const StatCard = ({ title, value, description }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Box
      w={{ base: '100%', sm: '48%', md: '24%' }}
      p={5}
      bg="gray.50" // softer card background
      boxShadow="lg" // stronger, soft shadow for depth
      borderRadius="xl" // larger rounding for premium feel
      mb={5}
      _hover={{
        boxShadow: 'xl', // on hover, a slightly more elevated shadow
        transform: 'scale(1.02)', // small scale effect for interactivity
        transition: 'all 0.2s ease-in-out',
      }}
      border="1px solid"
      borderColor="gray.100"
    >
      <Stat color="gray.700"> {/* soft dark gray instead of pure black */}
        <StatLabel fontWeight="semibold" fontSize="md">
          {title}
        </StatLabel>
        <StatNumber fontWeight="bold" fontSize="2xl">
          {value}
        </StatNumber>
        <StatHelpText fontSize="sm">{description}</StatHelpText>
        {showDetails && (
          <Text mt={3} color="gray.600">
            Here are the details for {title}.
          </Text>
        )}
        <Button
          mt={4}
          colorScheme="teal"
          bgGradient="linear(to-r, teal.400, teal.500)"
          _hover={{
            bgGradient: 'linear(to-r, teal.500, teal.600)',
            boxShadow: 'md',
          }}
          onClick={handleClick}
        >
          {showDetails ? 'Show Less' : 'Show More'}
        </Button>
      </Stat>
    </Box>
  );
  
};
export default DashboardPreview; 









