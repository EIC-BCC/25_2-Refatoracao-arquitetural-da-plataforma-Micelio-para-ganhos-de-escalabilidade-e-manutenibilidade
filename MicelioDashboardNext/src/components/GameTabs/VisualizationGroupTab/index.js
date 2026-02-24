import { Box, Button, Flex, Heading, Link, Select, Text, Spinner, Grid } from '@chakra-ui/react';
import { MdOutlineDashboard } from 'react-icons/md';
import { BsPencilSquare } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import Api from '../../../services/Api';
import CreateVisualizationGroupModal from '../../_modals/CreateVisualizationGroupModal';
import Visualization from '../../Visualization';

export default function VisualizationGroupTab({ gameId }) {
  const [visualizationGroups, setVisualizationGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState({});
  const [sessions, setSessions] = useState([]);
  const [sessionData, setSessionData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisualizationGroupModalOpen, setIsVisualizationGroupModalOpen] = useState(false);

  useEffect(() => {
    if (gameId) {
      getVisualizationGroupList();
    }
  }, [gameId]);

  useEffect(() => {
    if (currentGroup?.visualizationgroup_id) {
      loadGroupSessions();
    }
  }, [currentGroup]);

  const getVisualizationGroupList = async () => {
    try {
      const response = await Api.get(`/visualization-group/${gameId}`);
      setVisualizationGroups(response.data);
    } catch (e) {
      console.error('Error fetching visualization groups:', e);
    }
  };

  const loadGroupSessions = async () => {
    setIsLoading(true);
    try {
      // Get sessions in this group
      const response = await Api.get(`/visualization-group/${currentGroup.visualizationgroup_id}/sessions`);
      const groupSessions = response.data;
      setSessions(groupSessions);

      // Load activity data for each session
      const dataPromises = groupSessions.map(async (session) => {
        try {
          // Get the first visualization for this game to use as default config
          const visualizations = await Api.get(`/visualization/${gameId}`);
          const defaultViz = visualizations.data[0];
          
          // Fetch session data with optional visualization_id
          const url = defaultViz 
            ? `/visualization/session/${session.session_id}?visualization_id=${defaultViz.visualization_id}`
            : `/visualization/session/${session.session_id}`;
            
          const sessionResponse = await Api.get(url);
          
          return {
            session_id: session.session_id,
            name: session.name,
            data: sessionResponse.data
          };
        } catch (error) {
          console.error(`Error loading session ${session.session_id}:`, error);
          return {
            session_id: session.session_id,
            name: session.name,
            data: null,
            error: error.message
          };
        }
      });

      const loadedData = await Promise.all(dataPromises);
      const dataMap = {};
      loadedData.forEach(item => {
        if (item) {
          dataMap[item.session_id] = item;
        }
      });
      
      setSessionData(dataMap);
    } catch (e) {
      console.error('Error loading group sessions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CreateVisualizationGroupModal
        isOpen={isVisualizationGroupModalOpen}
        gameId={gameId}
        onClose={() => {
          setIsVisualizationGroupModalOpen(false);
          getVisualizationGroupList();
        }}
      />
      
      <Flex justifyContent={'end'}>
        <Button 
          variant={'primary'} 
          onClick={() => setIsVisualizationGroupModalOpen(true)}
        >
          Criar grupo de visualização
        </Button>
      </Flex>

      <Flex w={'100%'} flexDirection={'column'} mt={5}>
        <Box display={currentGroup?.visualizationgroup_id ? 'none' : 'block'}>
          <Heading size={'md'} mb={3}>
            Escolha um grupo de visualização
          </Heading>
          <Select
            maxW={'400px'}
            onChange={(e) => {
              const selected = visualizationGroups.find((g) => g.visualizationgroup_id === e.target.value);
              setCurrentGroup(selected || {});
              setSessions([]);
              setSessionData({});
            }}
            value={currentGroup.visualizationgroup_id || ''}>
            <option value={''}>Selecione</option>
            {visualizationGroups.map((group) => (
              <option key={group.visualizationgroup_id} value={group.visualizationgroup_id}>
                {group.name}
              </option>
            ))}
          </Select>
        </Box>

        <Box display={currentGroup?.visualizationgroup_id ? 'block' : 'none'}>
          <Heading size={'md'} display={'inline'}>
            Grupo:
          </Heading>
          <Text display={'inline'} ms={2}>
            {currentGroup.name}
          </Text>
          <BsPencilSquare size={18} style={{ display: 'inline', marginLeft: 10 }} />
          <Link ms={1} onClick={() => {
            setCurrentGroup({});
            setSessions([]);
            setSessionData({});
          }}>
            Alterar
          </Link>
          
          {currentGroup.description && (
            <Text mt={2} color="gray.600">
              {currentGroup.description}
            </Text>
          )}

          {isLoading && (
            <Flex justifyContent="center" alignItems="center" mt={10}>
              <Spinner size="xl" />
              <Text ml={4}>Carregando sessões...</Text>
            </Flex>
          )}

          {!isLoading && sessions.length === 0 && (
            <Box mt={5} p={4} bg="yellow.50" borderRadius="md">
              <Text fontWeight="bold">Nenhuma sessão neste grupo</Text>
              <Text mt={2}>Adicione sessões a este grupo para visualizar os gráficos.</Text>
            </Box>
          )}

          {!isLoading && sessions.length > 0 && (
            <Box mt={5}>
              <Heading size="md" mb={4}>Sessões ({sessions.length})</Heading>
              
              {sessions.map((session) => {
                const data = sessionData[session.session_id];
                
                return (
                  <Box 
                    key={session.session_id} 
                    mb={8} 
                    p={5} 
                    borderWidth="1px" 
                    borderRadius="lg"
                    bg="white"
                  >
                    <Heading size="sm" mb={4}>
                      {session.name || `Sessão ${session.session_id}`}
                    </Heading>
                    
                    {data?.data ? (
                      <>
                        {console.log('Session data:', data.data)}
                        {console.log('Has activities:', !!data.data.activities)}
                        {console.log('Config:', data.data.config)}
                        
                        {!data.data.config || !data.data.config.graphs || data.data.config.graphs.length === 0 ? (
                          <Box p={4} bg="yellow.50" borderRadius="md">
                            <Text fontWeight="bold">Nenhuma visualização configurada</Text>
                            <Text mt={2}>
                              Vá para a aba "Visualizações" e crie uma visualização com gráficos para esta sessão.
                              Depois, volte aqui para ver os gráficos do grupo.
                            </Text>
                          </Box>
                        ) : data.data.activities && data.data.activities.length > 0 ? (
                          <Visualization
                            config={data.data.config}
                            currentSession={session.session_id}
                            activities={data.data.activities}
                          />
                        ) : (
                          <Box p={4} bg="orange.50" borderRadius="md">
                            <Text>Esta sessão não possui atividades para visualizar.</Text>
                          </Box>
                        )}
                      </>
                    ) : data?.error ? (
                      <Box p={4} bg="red.50" borderRadius="md">
                        <Text color="red.600">Erro ao carregar dados: {data.error}</Text>
                      </Box>
                    ) : (
                      <Flex justifyContent="center" p={4}>
                        <Spinner />
                        <Text ml={3}>Carregando dados...</Text>
                      </Flex>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Flex>

      {visualizationGroups.length === 0 && (
        <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} mt={20}>
          <MdOutlineDashboard size={64} color={'#cdcdcd'} />
          <Text mt={3}>Não há grupos de visualizações disponíveis</Text>
        </Flex>
      )}
    </>
  );
}