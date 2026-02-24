import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useContext, useEffect } from 'react';
import Api from '../../services/Api';
import { toast, ToastContainer } from  'react-toastify';
import { AuthContext } from '../../context/AuthContext';


export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmation_password, setConfirmationPassword ] = useState('');
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user]);

  const doRegister = async (formEvent) => {
    formEvent.preventDefault();

    try {
      const response = await Api.post('/user', { username, password, email, confirmation_password });
      console.log('Login response:', response.data);
      setUser(response.data.data);

      await router.push('/home');
    } catch (e) {
      const msg = e.response ? e.response.data.error : 'Houve um erro ao entrar. Por favor, tente novamente.';
      toast.error(msg);
    }
  };

  return (
    <Flex>
      <Flex flex={1} justifyContent={'center'} alignItems={'center'} h={'100vh'} >
        <Flex boxShadow={'0 0 5px #a5a5a5'} padding={8} borderRadius={8} w={'100%'} maxW={'400px'} flexDir={'column'}>
          <Heading textAlign={'center'}>Micelio</Heading>
          <Box mt={10}>
            <Heading size={'sm'} textAlign={'center'}>
              Cadastre-se
            </Heading>
            <form onSubmit={doRegister}>   
            <Input w={'100%'} placeholder={'Nome de usuário'} value={username} onChange={(e) => setUsername(e.target.value)}mt={4} />
            <Input w={'100%'} placeholder={'E-mail'}  value={email} onChange={(e) => setEmail(e.target.value)}mt={2} />
            <Input type={'password'} w={'100%'} placeholder={'Senha'}  value={password} onChange={(e) => setPassword(e.target.value)} mt={2} />
            <Input type={'password'} w={'100%'} placeholder={'Digite novamente a senha'} value={confirmation_password} onChange={(e) => setConfirmationPassword(e.target.value)}mt={2} />
            <Button w={'100%'} mt={5} variant={'primary'} type={'submit'}> 
              Cadastrar
            </Button>
            </form>
          </Box>
          <hr style={{ margin: 20 }} />
          <Text display={'flex'} flexDirection={'column'} textAlign={'center'}>
            Já possui uma conta? <br />
            <Link href={'/login'}>Faça Login</Link>
          </Text>
        </Flex>
      </Flex>
      <Flex flex={1} h={'100vh'} bg={'micelio.primary'} display='none'>
        xxx
      </Flex>
    </Flex>
  );
} 



 