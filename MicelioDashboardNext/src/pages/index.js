








import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import Link from 'next/link';
import Api from '../services/Api';
import { toast, ToastContainer } from  'react-toastify';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user]);

  const doLogin = async (formEvent) => {
    formEvent.preventDefault();

    try {
      const response = await Api.post('/user/login', { username, password });
      console.log('Login response:', response.data);
      setUser(response.data.data);

      await router.push('/home');
    } catch (e) {
      const msg = e.response ? e.response.data.error : 'Houve um erro ao entrar. Por favor, tente novamente.';
      toast.error(msg);
    }
  };

  return (
    <>
      <ToastContainer />
      <Flex>
        <Flex flex={1} justifyContent={'center'} alignItems={'center'} h={'100vh'}>
          <Flex boxShadow={'0 0 5px #a5a5a5'} padding={8} borderRadius={8} w={'100%'} maxW={'400px'} flexDir={'column'}>
            <Heading textAlign={'center'}>Micelio</Heading>
            <Box mt={10}>
              <Heading size={'sm'} textAlign={'center'}>
                Entre com sua conta
              </Heading>
              <form onSubmit={doLogin}>
                <Input
                  w={'100%'}
                  placeholder={'Usuário'}
                  mt={4}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={true}
                />
                <Input
                  type={'password'}
                  w={'100%'}
                  placeholder={'Senha'}
                  mt={2}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={true}
                />
                <Button type={'submit'} w={'100%'} mt={5} variant={'primary'}>
                  Entrar
                </Button>
              </form>
            </Box>
            <hr style={{ margin: 20 }} />
            <Text display={'flex'} flexDirection={'column'} textAlign={'center'}>
              Não possui uma conta? <br />
              <Link href={'/register'}>Cadastre-se</Link>
            </Text>
          </Flex>
        </Flex>
        {/*<Flex flex={1} h={'100vh'} bg={'micelio.primary'}>
          xxx
        </Flex> */}
      </Flex>
    </>
  );
}













/*

export default function Home() {
  return (
    <>
      <h1>Welcome to Next.JS</h1>
    
    </>
  )
}
*/







