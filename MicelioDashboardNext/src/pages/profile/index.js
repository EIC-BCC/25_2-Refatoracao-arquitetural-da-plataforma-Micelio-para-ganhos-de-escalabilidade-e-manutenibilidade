import { useState } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Button,
  Input,
} from '@chakra-ui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../../components/Header';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const doUpdateProfile = (e) => {
    e.preventDefault();
    toast.success('Perfil atualizado com sucesso!');
  };

  const doUpdatePassword = (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error('As senhas não coincidem!');
      return;
    }

    toast.success('Senha atualizada com sucesso!');
  };

  return (
    <>
      <ToastContainer />
      <Header pageName={'profile'} />

      <Flex justify="center" mt={10} px={{ base: 4, md: 10 }}>
        <Box
          width="100%"
          maxW="1200px"
          bg="white"
          borderRadius="2xl"
          boxShadow="md"
          p={{ base: 5, md: 10 }}
        >
          <Flex direction="column" gap={6}>
            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
              Meu perfil
            </Text>

            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={8}
              justify="center"
              align="flex-start"
              flexWrap="wrap"
            >
              {/* Profile Info Box */}
              <Box
                bg="#f7f7f7"
                borderRadius="xl"
                p={6}
                flex="1"
                minW={{ base: '100%', md: '420px' }}
                boxShadow="sm"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Text fontSize="lg" paddingBottom={6} fontWeight="bold">
                  Informações do perfil
                </Text>

                <form onSubmit={doUpdateProfile} style={{ width: '100%', maxWidth: '400px' }}>
                  <FormControl>
                    <FormLabel htmlFor="username" fontWeight="bold">
                      Username
                    </FormLabel>
                    <Input
                      name="username"
                      type="text"
                      placeholder="Digite seu nome de usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      w="100%"
                    />
                  </FormControl>

                  <FormControl paddingTop={5}>
                    <FormLabel htmlFor="email" fontWeight="bold">
                      E-mail
                    </FormLabel>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Digite seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      w="100%"
                    />
                    <FormErrorMessage>E-mail inválido</FormErrorMessage>
                  </FormControl>

                  <FormControl paddingTop={5}>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      w="100%"
                      mt={4}
                      size="md"
                      borderRadius="lg"
                    >
                      Atualizar perfil
                    </Button>
                  </FormControl>
                </form>
              </Box>

              {/* Password Update Box */}
              <Box
                bg="#f7f7f7"
                borderRadius="xl"
                p={6}
                flex="1"
                minW={{ base: '100%', md: '420px' }}
                boxShadow="sm"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Text fontSize="lg" paddingBottom={6} fontWeight="bold">
                  Atualizar senha
                </Text>

                <form onSubmit={doUpdatePassword} style={{ width: '100%', maxWidth: '400px' }}>
                  <FormControl paddingTop={2}>
                    <FormLabel htmlFor="currentPassword" fontWeight="bold">
                      Senha atual
                    </FormLabel>
                    <Input
                      name="currentPassword"
                      type="password"
                      placeholder="Digite sua senha atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      w="100%"
                    />
                  </FormControl>

                  <FormControl paddingTop={5}>
                    <FormLabel htmlFor="password" fontWeight="bold">
                      Nova senha
                    </FormLabel>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Digite uma nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      w="100%"
                    />
                  </FormControl>

                  <FormControl paddingTop={5}>
                    <FormLabel htmlFor="passwordConfirm" fontWeight="bold">
                      Confirme sua nova senha
                    </FormLabel>
                    <Input
                      name="passwordConfirm"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      w="100%"
                    />
                  </FormControl>

                  <FormControl paddingTop={5}>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      w="100%"
                      mt={4}
                      size="md"
                      borderRadius="lg"
                    >
                      Atualizar senha
                    </Button>
                  </FormControl>
                </form>
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </>
  );
};

export default Profile;
