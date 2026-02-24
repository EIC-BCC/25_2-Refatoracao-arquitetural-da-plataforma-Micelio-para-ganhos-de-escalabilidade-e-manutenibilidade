
/*
import { Box, Button, Container, Flex, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { HeaderMenu, HeaderMenuItem } from './Menu';
import { AiFillHome, AiFillInfoCircle, AiOutlineUser } from 'react-icons/ai';
import Link from 'next/link';

export default function Header({ pageName = 'home' }) {
  return (
    <>
      <Flex flexDirection={'column'} bg={'micelio.primary'} pt={3} pb={3}>
        <Container maxW={'container.xl'}>
          <Flex>
            <Heading flex={1} color={'white'}>
              <Link href={'/home'}>Micelio</Link>
            </Heading>
            <Flex flex={3}>
              <HeaderMenu>
                <Link href={'/home'}>
                  <HeaderMenuItem className={pageName === 'home' && 'selected'}>
                    <Flex alignItems={'center'}>
                      <AiFillHome color={'white'} />
                      <Text ms={1}>Início</Text>
                    </Flex>
                  </HeaderMenuItem>
                </Link>
                <Link href={'/about'}>
                  <HeaderMenuItem className={pageName === 'about' && 'selected'}>
                    <Flex alignItems={'center'}>
                      <AiFillInfoCircle color={'white'} />
                      <Text ms={1}>Sobre</Text>
                    </Flex>
                  </HeaderMenuItem>
                </Link>
                <Link href={'/profile'}>
                  <HeaderMenuItem className={pageName === 'profile' && 'selected'}>
                    <Flex alignItems={'center'}>
                      <AiOutlineUser color={'white'} />
                      Perfil
                    </Flex>
                  </HeaderMenuItem>
                </Link>
              </HeaderMenu>
            </Flex>
            <Flex flex={1} justifyContent={'end'} alignItems={'center'}>
              <Button>Sair</Button>
            </Flex>
          </Flex>
        </Container>
      </Flex>
    </>
  );
}
*/





/*
import { Box, Button, Container, Flex, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { HeaderMenu, HeaderMenuItem } from './Menu';
import { AiFillHome, AiFillInfoCircle, AiOutlineUser } from 'react-icons/ai';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Import Next.js router

export default function Header({ pageName = 'home' }) {
  const router = useRouter();

  // Function to handle logout logic
  const handleLogout = () => {
    // Clear session storage or cookies if needed
    sessionStorage.clear(); // Example: Clear session storage
    localStorage.removeItem('authToken'); // Example: Remove auth token if used

    // Redirect to the login page
    router.push('/login'); // Replace '/login' with the desired route
  };

  return (
    <>
      <Flex flexDirection={'column'} bg={'micelio.primary'} pt={3} pb={3}>
        <Container maxW={'container.xl'}>
          <Flex>
            <Heading flex={1} color={'white'}>
              <Link href={'/home'}>Micelio</Link>
            </Heading>
            <Flex flex={3}>
              <HeaderMenu>
                <Link href={'/home'}>
                  <HeaderMenuItem className={pageName === 'home' && 'selected'}>
                    <Flex alignItems={'center'}>
                      <AiFillHome color={'white'} />
                      <Text ms={1}>Início</Text>
                    </Flex>
                  </HeaderMenuItem>
                </Link>
                <Link href={'/about'}>
                  <HeaderMenuItem className={pageName === 'about' && 'selected'}>
                    <Flex alignItems={'center'}>
                      <AiFillInfoCircle color={'white'} />
                      <Text ms={1}>Sobre</Text>
                    </Flex>
                  </HeaderMenuItem>
                </Link>
                <Link href={'/profile'}>
                  <HeaderMenuItem className={pageName === 'profile' && 'selected'}>
                    <Flex alignItems={'center'}>
                      <AiOutlineUser color={'white'} />
                      <Text ms={1}>Perfil</Text>
                    </Flex>
                  </HeaderMenuItem>
                </Link>
              </HeaderMenu>
            </Flex>
            <Flex flex={1} justifyContent={'end'} alignItems={'center'}>
              <Button onClick={handleLogout}>Sair</Button> {/* Add onClick handler */
           /* </Flex>
          </Flex>
        </Container>
      </Flex>
    </>
  );
}
  */



import { Box, Button, Container, Flex, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { HeaderMenu, HeaderMenuItem } from './Menu';
import { AiFillHome, AiFillInfoCircle, AiOutlineUser } from 'react-icons/ai';
import Link from 'next/link';
import Api from '../../services/Api';
import { useRouter } from 'next/router'; // Import Next.js router

export default function Header({ pageName = 'home' }) {
  const router = useRouter();

  // Function to handle logout logic
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      const response = await Api.delete('/user/login', {
        method: 'DELETE',
        credentials: 'include', // Include cookies in the request
      });

      if (response.status==200) {
        // Clear session storage or other client-side data
        sessionStorage.clear();
        localStorage.removeItem('authToken');

        // Redirect to the login page
        router.push('/login'); // Replace '/login' with the desired route
      } else {
        console.error('Failed to log out:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <Flex flexDirection="column" bg="micelio.primary" pt={3} pb={3}>
  <Container maxW="container.xl">
    <Flex align="center">
      <Heading flex={1} color="white" size="lg">
        <Link href="/home">Micelio</Link>
      </Heading>

      <Flex flex={3} justify="center" gap={8}>
        <Link href="/home">
          <HeaderMenuItem borderBottom={pageName === 'home' ? '2px solid white' : 'none'}>
            <Flex align="center" color="white" fontWeight={pageName === 'home' ? 'bold' : 'normal'}>
              <AiFillHome />
              <Text ms={1}>Início</Text>
            </Flex>
          </HeaderMenuItem>
        </Link>
        <Link href="/about">
          <HeaderMenuItem borderBottom={pageName === 'about' ? '2px solid white' : 'none'}>
            <Flex align="center" color="white" fontWeight={pageName === 'about' ? 'bold' : 'normal'}>
              <AiFillInfoCircle />
              <Text ms={1}>Sobre</Text>
            </Flex>
          </HeaderMenuItem>
        </Link>
        <Link href="/profile">
          <HeaderMenuItem borderBottom={pageName === 'profile' ? '2px solid white' : 'none'}>
            <Flex align="center" color="white" fontWeight={pageName === 'profile' ? 'bold' : 'normal'}>
              <AiOutlineUser />
              <Text ms={1}>Perfil</Text>
            </Flex>
          </HeaderMenuItem>
        </Link>
      </Flex>

      <Flex flex={1} justify="flex-end" align="center">
        <Button variant="outline" color="white" borderColor="white" _hover={{ bg: 'whiteAlpha.200' }} onClick={handleLogout}>
          Sair
        </Button>
      </Flex>
    </Flex>
  </Container>
</Flex>

    </>
  );
}
