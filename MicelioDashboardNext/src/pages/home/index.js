
import Header from '../../components/Header';
import axios from 'axios';
import { Box, Button, Container, Flex, Grid, GridItem, Heading, Text } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import Api from '../../services/Api';
import { toast, ToastContainer } from 'react-toastify';
import { IoGameController } from 'react-icons/io5';
import { BsPlusCircle } from 'react-icons/bs';
import GameCard from '../../components/GameCard';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import CreateGameModal from '../../components/_modals/CreateGameModal';
import DashboardPreview from '../../components/DashboardPreview'; 

export default function HomePage() {
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [summaryData, setSummaryData] = useState([]);  
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    doUpdateGamelist();
    fetchDashboardSummary();  
  }, []);

  const doUpdateGamelist = async () => {
    try {
      const response = await Api.get('/game');
      setGameList(response.data.data);
    } catch (e) {
      const msg = e.response ? e.response.data.error : 'Houve um erro ao entrar. Por favor, tente novamente.';
      toast.error(msg);
    }
  };

  // Function to fetch or calculate summary data for the dashboard preview
  const fetchDashboardSummary = async () => {
    try {
      // Example API call to get summary data
      const response = await Api.get('/dashboard/summary');
      setSummaryData(response.data.data);
    } catch (e) {
      toast.error('Failed to load dashboard summary.');
    }
  };

  return (
    <>
      <CreateGameModal
        isOpen={isGameModalOpen}
        onClose={() => {
          setIsGameModalOpen(false);
        }}
        onCreateGame={async () => {
          setIsGameModalOpen(false);
          await doUpdateGamelist();
        }}
      />
      <ToastContainer />
  <Header />
  <Container maxW={'container.xl'} mt={10}>
    {/* Dashboard Preview Section */}
    <DashboardPreview summaryData={summaryData} />

    {/* Title and Create button always visible */}
    <Flex
        justifyContent={'space-between'}
        alignItems={'center'}
        mb={8}
        px={6}
        py={4}
       // bg={useColorModeValue('white', 'gray.800')}
        borderRadius={'2xl'}
        boxShadow={'sm'}
      >
        <Box>
          <Heading size={'lg'}>Seus jogos</Heading>
          <Text fontSize={'sm'} color={'gray.500'}>
            Gerencie, organize e acompanhe seus jogos cadastrados.
          </Text>
        </Box>
        
        <Button
          leftIcon={<BsPlusCircle />}
          colorScheme={'teal'}
          size={'md'}
          borderRadius={'full'}
          shadow={'md'}
          _hover={{ shadow: 'lg', transform: 'scale(1.02)' }}
          onClick={() => setIsGameModalOpen(true)}
        >
          Novo jogo
        </Button>
        
      </Flex>

    {/* Conditional rendering only for the list or no games message */}
    {gameList && gameList.length > 0 ? (
      <GameList gameList={gameList} />
    ) : (
      <NoGamesAvailable />
    )}
  </Container>
</>
  );
}

// NoGamesAvailable Component
const NoGamesAvailable = () => {
  return (
    <Flex w={'100%'} h={'100%'} mt={20} justifyContent={'center'} alignItems={'center'}>
          <Flex
            flexDirection={'column'}
            alignItems={'center'}
            //bg={useColorModeValue('gray.50', 'gray.700')}
            p={10}
            borderRadius={'2xl'}
            boxShadow={'md'}
            textAlign={'center'}
          >
            <IoGameController size={48} color={'teal'} />
            <Text fontWeight={'bold'} fontSize={'lg'} mt={4}>
              Nenhum jogo cadastrado
            </Text>
            <Text color={'gray.500'} fontSize={'sm'} mt={1}>
              Crie seu primeiro jogo para começar.
            </Text>
            {/*
            <Button
              leftIcon={<BsPlusCircle />}
              colorScheme={'teal'}
              variant={'solid'}
              mt={6}
              borderRadius={'full'}
              onClick={() => setIsGameModalOpen(true)}
            >
              Novo jogo
            </Button>
            */}
            
          </Flex>
        </Flex>
);
};

// GameList Component
const GameList = ({ gameList }) => {
  return (
    <Grid templateColumns={'1fr 1fr 1fr 1fr'} columnGap={5}>
      {gameList &&
        gameList.map((game) => (
          <GridItem key={game.game_id}>
            <GameCard
              id={game.game_id}
              title={game.name}
              groupCount={game.groups_created}
              activeSessionCount={game.active_sessions}
              status={'Privado'}
              isOwner={game.is_owner}
            />
          </GridItem>
        ))}
    </Grid>
  );
};



/*


\section{Frontend UI Enhancements}

\subsection{Card Styling and Descriptive Text}

Recent changes were made to improve the dashboard interface for managing games:

\begin{itemize}
  \item \textbf{Card Color Adjustment:} The background color of the cards was modified to improve visual contrast and clarity.
  
  \item \textbf{Component Descriptions Added:} Small descriptive texts were added beneath headings and inside empty-state views to guide the user:
  \begin{itemize}
    \item On the top section, a description under ``Seus jogos'' informs users about managing and organizing their games.
    \item In the \texttt{NoGamesAvailable} component, a friendly message now prompts users to create their first game.
  \end{itemize}
  
  \item \textbf{\texttt{NoGamesAvailable} Component:}  
  This component is displayed when no games are registered. It uses a centered layout with a game controller icon, bold and secondary messages, and a consistent card-style container. The design helps improve user experience by clearly indicating that there is no data and encouraging the user to take action.

  \item \textbf{Improved Button UX:} Hover effects and icons were added to the ``Novo jogo'' button to enhance interactivity and visual feedback.
\end{itemize}

These changes aim to improve the usability, clarity, and visual appeal of the game management dashboard.










*/
