import { Box, Button, Flex, Heading, Link, LinkBox, LinkOverlay, Select, Text } from '@chakra-ui/react';
import { AiOutlineAreaChart } from 'react-icons/ai';
import Api from '../../../services/Api';
import { useEffect, useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import CreateVisualizationModal from '../../_modals/CreateVisualizationModal';
import Visualization from '../../Visualization';

export default function VisualizationTab({ gameId }) {
  const [visualizations, setVisualizations] = useState([]);
  const [currentVisualization, setCurrentVisualization] = useState({});
  const [sessionList, setSessionList] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false);

  const [gameData, setGameData] = useState({});

  useEffect(() => {
  if (gameId) {  // ⬅️ Add this check
    getVisualizationList();
    getSessionList();
  }
}, [gameId]);  // ⬅️ Add gameId as dependency

 useEffect(() => {
  if (currentVisualization && currentSession) {
    console.log(currentVisualization, currentSession, 'AQUI');
    Api.get(`/visualization/session/${currentSession.session_id}?visualization_id=${currentVisualization.visualization_id}`)
      .then((response) => {
        console.log('Game data received:', response.data);  // Add this log
        setGameData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching game data:', error);  // Add error handling
      });
  }
}, [currentVisualization, currentSession]);
  useEffect(() => {
    console.log('VISUALIZACAO', currentVisualization);
    if (currentVisualization.config) {
      console.log('CONFIG', JSON.parse(currentVisualization.config));
    }
  }, [currentVisualization]);

  const getVisualizationList = async () => {
    try {
      const response = await Api.get(`/visualization/${gameId}`);
      setVisualizations(response.data);
    } catch (e) {
      console.error(e.response);
    }
  };

  const getSessionList = async () => {
  try {
    console.log('Fetching sessions for gameId:', gameId); // ⬅️ Add this
    const response = await Api.get(`/session/${gameId}`);
    console.log('Sessions received:', response.data); // ⬅️ Add this
    setSessionList(response.data);
  } catch (e) {
    console.error('Error fetching sessions:', e); // ⬅️ Add this
  }
};

  const doDrawVisualization = () => {};

  return (
    <>
      <CreateVisualizationModal
        isOpen={isVisualizationModalOpen}
        gameId={gameId}
        onClose={() => {
          setIsVisualizationModalOpen(false);
        }}
      />
      <Flex justifyContent={'end'}>
        <Button variant={'primary'} onClick={() => setIsVisualizationModalOpen(true)}>
          Criar visualização
        </Button>
      </Flex>
      <Flex w={'100%'} flexDirection={'column'} mt={5}>
        <Box display={currentVisualization?.visualization_id ? 'none' : 'block'}>
          <Heading size={'md'} mb={3}>
            Escolha uma visualização
          </Heading>
          <Select
            maxW={'400px'}
            onChange={(e) => {
              const currentVis = visualizations.find((v) => v.visualization_id === e.target.value);
              setCurrentVisualization(currentVis);
            }}
            value={currentVisualization.visualization_id}>
            <option value={''}>Selecione</option>
            {visualizations.map((v) => (
              <option key={v.visualization_id} value={v.visualization_id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box display={currentVisualization?.visualization_id ? 'block' : 'none'}>
          <Heading size={'md'} display={'inline'}>
            Visualização:
          </Heading>
          <Text display={'inline'} ms={2}>
            {currentVisualization.name}
          </Text>
          <BsPencilSquare size={18} style={{ display: 'inline', marginLeft: 10 }} />
          <Link ms={1} onClick={() => setCurrentVisualization({ visualization_id: '' })}>
            Alterar
          </Link>
        </Box>
        <Box mt={5} display={currentVisualization?.visualization_id && !currentSession?.session_id ? 'block' : 'none'}>
          <Heading size={'md'} mb={3}>
            Escolha uma sessão
          </Heading>
          <Select
            maxW={'400px'}
            onChange={(e) =>
              setCurrentSession({
                session_id: e.target.value,
                name: e.target.options[e.target.selectedIndex].textContent,
              })
            }>
            <option value={''}>Selecione</option>
            {sessionList.map((session) => (
              <option key={session.session_id} value={session.session_id}>
        {session.name}
      </option>
            ))}
          </Select>
        </Box>
        <Box display={currentSession?.session_id ? 'block' : 'none'}>
          <Heading size={'md'} display={'inline'}>
            Sessão:
          </Heading>
          <Text display={'inline'} ms={2}>
            {currentSession?.name}
          </Text>
          <BsPencilSquare size={18} style={{ display: 'inline', marginLeft: 10 }} />
          <Link ms={1} onClick={() => setCurrentSession({ id: '' })}>
            Alterar
          </Link>
        </Box>
      </Flex>
      
      
      {console.log('🔍 Check before render:', {
  hasCurrentVis: !!currentVisualization,
  hasConfig: !!currentVisualization?.config,
  gameData: gameData,
  hasActivities: !!gameData?.activities
})}





   {currentVisualization?.config && currentSession?.session_id && gameData?.activities && (
  <Visualization
    config={JSON.parse(currentVisualization.config)}
    currentSession={currentSession.session_id}
    activities={gameData.activities}
  />
)}

      

      {visualizations.length === 0 && (
        <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} mt={20}>
          <AiOutlineAreaChart size={64} color={'#cdcdcd'} />
          <Text mt={3}>Não há visualizações disponíveis</Text>
        </Flex>
      )}
    </>
  );
}






/*useEffect(() => {
  console.log('VISUALIZACAO', currentVisualization);
  if (currentVisualization.config) {
    console.log('CONFIG', JSON.parse(currentVisualization.config));
  }
}, [currentVisualization]);








{currentVisualization && currentVisualization.config && (() => {
  let configData;
  try {
    configData = JSON.parse(currentVisualization.config);
  } catch (error) {
    console.error("Invalid JSON format in config:", error);
    configData = {}; // Provide a default empty object as fallback
  }

  return (
    <Visualization activities={gameData.activities} config={configData} />
  );
})()}
*/