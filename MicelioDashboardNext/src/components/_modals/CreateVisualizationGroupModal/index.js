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

const CreateVisualizationGroupModal = ({ isOpen, onClose, gameId }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const doCreateVisualizationGroup = async () => {
    try {
      await Api.post(`/visualization-group/${gameId}`, {
        name: groupName,
        description: groupDescription,
      });

      toast.success("Grupo de visualização criado com sucesso!");

      onClose();
      setGroupName("");
      setGroupDescription("");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Erro ao criar grupo de visualização");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setGroupName("");
        setGroupDescription("");
      }}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar grupo de visualização</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Input
            placeholder="Nome do grupo"
            w="100%"
            mb={4}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <Textarea
            placeholder="Descrição (opcional)"
            w="100%"
            minH="120px"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              setGroupName("");
              setGroupDescription("");
            }}
          >
            Cancelar
          </Button>

          <Button colorScheme="blue" ml={3} onClick={doCreateVisualizationGroup}>
            Criar Grupo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateVisualizationGroupModal;
