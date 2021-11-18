import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import NextImage from 'next/image';
import {
	chakra,
	Button,
	Flex,
	Grid,
	Heading,
	HStack,
	Icon,
	List,
	ListIcon,
	ListItem,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	Tag,
	Text,
	VStack,
	useColorMode,
	useColorModeValue,
	useDisclosure,
} from '@chakra-ui/react';
import { LogIn, Moon, Sun } from 'react-feather';
import { MdCheckCircle } from 'react-icons/md';
import AuthBasic from '../Auth';
import AuthModal from '../AuthModal';

export default function Header() {
	const {
		isOpen: isAuthModalOpen,
		onOpen: onAuthModalOpen,
		onClose: onAuthModalClose,
	} = useDisclosure();
	const { colorMode, toggleColorMode: toggleMode } = useColorMode();
	const text = useColorModeValue('dark', 'light');
	const SwitchIcon = useColorModeValue(Moon, Sun);

	return (
		<Flex
			as='header'
			w='full'
			h={16}
			px={6}
			alignItems='center'
			justifyContent='space-between'
			overflowY='hidden'
		>
			<Grid w='full' h='full' templateColumns='repeat(2, 1fr)' gap={4}>
				{/* Logo */}
				<Flex
					align='center'
					justifyContent='start'
					fontSize='xl'
					fontWeight='bold'
					color={useColorModeValue('gray.900', 'white')}
				>
					<NextLink href='/'>
						<chakra.a
							d='flex'
							alignItems='center'
							justifyContent='center'
							cursor='pointer'
						>
							{colorMode === 'dark' ? (
								<NextImage
									src='/images/logo_dark.png'
									width={108}
									height={60}
									alt='Aurelius Logo'
								/>
							) : (
								<NextImage
									src='/images/logo.png'
									width={108}
									height={60}
									alt='Aurelius Logo'
								/>
							)}
						</chakra.a>
					</NextLink>
					<Tag ml={4}>Beta</Tag>
				</Flex>

				{/* Settings & Account */}
				<HStack
					h='full'
					align='center'
					justifyContent='end'
					fontSize='xl'
					fontWeight='bold'
					color={useColorModeValue('gray.900', 'white')}
					spacing={4}
				>
					<Button
						aria-label={`Switch to ${text} mode`}
						w={10}
						h={10}
						p={0}
						rounded='md'
						d='flex'
						align='center'
						justify='center'
						onClick={toggleMode}
						variant='ghost'
					>
						<Icon as={SwitchIcon} />
					</Button>

					<Button
						aria-label='sign in'
						w={10}
						h={10}
						p={0}
						rounded='md'
						d='flex'
						align='center'
						justify='center'
						variant='ghost'
						onClick={onAuthModalOpen}
					>
						<Icon as={LogIn} />
					</Button>
				</HStack>
			</Grid>
			<AuthModal
				isAuthModalOpen={isAuthModalOpen}
				onAuthModalClose={onAuthModalClose}
			/>
		</Flex>
	);
}
