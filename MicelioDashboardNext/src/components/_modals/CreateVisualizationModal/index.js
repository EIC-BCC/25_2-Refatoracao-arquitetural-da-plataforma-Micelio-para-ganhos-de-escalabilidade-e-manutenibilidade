import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import Api from "../../../services/Api";
import { toast } from "react-toastify";
import Visualization from "../../Visualization/Visualization";

const CreateVisualizationModal = ({ gameId, isOpen, onClose }) => {
  const [visualizationName, setVisualizationName] = useState("");
  const [visualizationContent, setVisualizationContent] = useState(`{\n  "graphs": []\n}`);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [activities, setActivities] = useState([]);

  const doCreateVisualization = async () => {
    try {
      await Api.post(`/visualization/${gameId}`, {
        name: visualizationName,
        config: JSON.parse(visualizationContent),
      });

      toast.success("Visualização cadastrada com sucesso");
      onClose();
      setVisualizationName("");
      setVisualizationContent(`{\n  "graphs": []\n}`);
      setPreviewConfig(null);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erro ao criar visualização");
    }
  };

  const handlePreview = async () => {
    try {
      const parsedConfig = JSON.parse(visualizationContent);
      setPreviewConfig(parsedConfig);

      // Load related activities (for example purposes, adapt as needed)
      const res = await Api.get(`/activity/by-game/${gameId}`);
      setActivities(res.data.activities || []);
    } catch (e) {
      toast.error("Configuração inválida ou erro ao carregar dados.");
      console.error(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setVisualizationName("");
        setVisualizationContent(`{\n  "graphs": []\n}`);
        setPreviewConfig(null);
      }}
      size="6xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar visualização</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Nome da visualização"
            w="100%"
            mb={4}
            value={visualizationName}
            onChange={(e) => setVisualizationName(e.target.value)}
          />

          <Textarea
            fontFamily="monospace"
            w="100%"
            minH="200px"
            value={visualizationContent}
            onChange={(e) => setVisualizationContent(e.target.value)}
          />

          <Button mt={3} colorScheme="blue" onClick={handlePreview}>
            Pré-visualizar
          </Button>

          <Box mt={5}>
            <strong>Prévia:</strong>
            <Box mt={3} border="1px solid #E2E8F0" borderRadius="md" p={2}>
              {previewConfig ? (
                <Visualization
                  activities={activities}
                  config={previewConfig}
                />
              ) : (
                <Box color="gray.500" fontSize="sm">
                  Nenhuma visualização carregada.
                </Box>
              )}
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              setVisualizationName("");
              setVisualizationContent(`{\n  "graphs": []\n}`);
              setPreviewConfig(null);
            }}
          >
            Cancelar
          </Button>
          <Button colorScheme="green" ml={3} onClick={doCreateVisualization}>
            Criar visualização
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateVisualizationModal;
