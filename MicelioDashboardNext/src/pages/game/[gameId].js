import styled from 'styled-components';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { useEffect, useState } from 'react';
import Api from '../../services/Api';
import { Box, Button, Container, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useToast } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { FaShareAlt } from 'react-icons/fa';
import GroupTab from '../../components/GameTabs/GroupTab';
import VisualizationTab from '../../components/GameTabs/VisualizationTab';
import VisualizationGroupTab from '../../components/GameTabs/VisualizationGroupTab';
import ShareModal from '../../components/_modals/ShareModal';
import axios from 'axios';

export default function GamePage(props) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [groups, setGroups] = useState();
  const router = useRouter();
  const toast = useToast();  // Initialize toast here
  const { gameId } = router.query;

  useEffect(() => {
    Api.get(`/game/${gameId}`).then((response) => {
      console.log(response.data);
      setCurrentGame(response.data.game);
      setGroups(response.data.groups);
    });
  }, [gameId]);


  const handleDeleteGame = async () => {
   
    try {
      
      await Api.delete(`/game/${gameId}`);
      toast({
        title: 'Jogo deletado.',
        description: 'O jogo foi deletado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push('/home');
    } catch (error) {
      toast({
        title: 'Erro ao deletar o jogo.',
        description: 'Ocorreu um erro ao tentar deletar o jogo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
console.log("GamePage gameId =", gameId);

  return (
    <>
      <ShareModal gameId={gameId} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <Box h={'100vh'}>
        <Header />
        <Container maxW={'container.xl'} mt={10}>
          <Link href={'/home'}>
            <Flex display={'flex'} alignItems={'center'} cursor={'pointer'} fontSize={16}>
              <FiArrowLeft style={{ marginRight: 5 }} size={18} />
              <Text>Voltar</Text>
            </Flex>
          </Link>
          <Flex mt={5}>
            <Flex
              flexDir={'column'}
              flex={2}
              alignItems={'center'}
              boxShadow={'0 0 10px #cdcdcd'}
              bg={'white'}
              borderRadius={8}
              p={10}
              pb={5}
              maxW={'300px'}>
              <GameImage>
                <Text>JT</Text>
              </GameImage>
              <Box mt={4}>
                <Heading>{currentGame?.name}</Heading>
                <hr style={{ marginTop: 15, marginBottom: 15 }} />
              </Box>
              <Box bg={'gray.200'} w={'100%'} borderRadius={8} p={2}>
                <Text>
                  <strong>Versão:</strong> {currentGame?.version}
                </Text>
                <Text>
                  <strong>Criador:</strong> {currentGame?.username}
                </Text>
              </Box>
              <Button mt={8} fontWeight={'bold'} onClick={() => setIsShareModalOpen(!isShareModalOpen)}>
                <FaShareAlt style={{ marginRight: 4 }} />
                Compartilhar
              </Button>
              <Button bg={'red'} color={'white'} mt={2} fontWeight={'bold'}  onClick={handleDeleteGame} >
                Deletar jogo
              </Button>
            </Flex>
            <Tabs flex={1} variant="soft-rounded" colorScheme="facebook" ms={10} w={'100%'}>
              <TabList>
                <Tab>Grupos</Tab>
                <Tab>Visualizações</Tab>
                <Tab>Grupos de visualização</Tab>
              </TabList>
              <TabPanels>
                <TabPanel mt={5}>
                  <GroupTab gameId={gameId} groups={groups}  />
                </TabPanel>
                <TabPanel mt={5}>
                  <VisualizationTab gameId={gameId} />
                </TabPanel>
                <TabPanel mt={5}>
                  <VisualizationGroupTab gameId={gameId} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Container>
      </Box>
    </>
  );
}

const GameImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;

  color: white;
  font-weight: bold;
  font-size: 42px;

  border-radius: 50%;
  background-color: #6f6f6f;
`;



// Make the delete request

// Redirect or update the UI as needed