import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import NextImage from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/router';
import {
	Avatar,
	Button,
	Flex,
	Grid,
	GridItem,
	Heading,
	HStack,
	FormControl,
	FormLabel,
	Icon,
	IconButton,
	Input,
	Link,
	List,
	ListIcon,
	ListItem,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	Modal,
	ModalOverlay,
	ModalCloseButton,
	ModalContent,
	ModalBody,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverBody,
	PopoverArrow,
	Radio,
	RadioGroup,
	Stack,
	Switch,
	Tag,
	Text,
	Tooltip,
	VStack,
	useColorMode,
	useColorModeValue,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import { Download, Edit3, LogIn, Moon, Square, Sun, User } from 'react-feather';
import {
	MdCenterFocusStrong,
	MdCheckCircle,
	MdOutlineSpaceDashboard,
} from 'react-icons/md';
import { supabase } from '../lib/supabase';
import Timer from './Timer';
import AuthBasic from './Auth';
import Settings from './Settings';

export default function Header(props) {
	const {
		authSession,
		downloadAsMarkdown,
		isEditorEmpty,
		isSaving,
		distractionFreeMode,
		saveSession,
		setDistractionFreeMode,
		setMusicPlaying,
		session,
		setSession,
		wordCount,
	} = props;
	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isAuthModalOpen,
		onOpen: onAuthModalOpen,
		onClose: onAuthModalClose,
	} = useDisclosure();
	const {
		isOpen: isSettingsModalOpen,
		onOpen: onSettingsModalOpen,
		onClose: onSettingsModalClose,
	} = useDisclosure();
	const {
		isOpen: isAboutModalOpen,
		onOpen: onAboutModalOpen,
		onClose: onAboutModalClose,
	} = useDisclosure();
	const {
		isOpen: isEndSessionModalOpen,
		onOpen: onEndSessionModalOpen,
		onClose: onEndSessionModalClose,
	} = useDisclosure();
	const { colorMode, toggleColorMode: toggleMode } = useColorMode();
	const text = useColorModeValue('dark', 'light');
	const SwitchIcon = useColorModeValue(Moon, Sun);
	const router = useRouter();
	// TODO: Save session duration to state and show a modal with total time spent writing in current session
	const [sessionDuration, setSessionDuration] = useState(0);
	const [sessionGoal, setSessionGoal] = useState('duration');
	const [sessionTarget, setSessionTarget] = useState(0);
	const [sessionMusic, setSessionMusic] = useState(false);
	const [showEndOfSessionNotification, setShowEndOfSessionNotification] =
		useState(false);
	const toast = useToast();

	useEffect(() => {
		if (sessionDuration > 0) {
			onEndSessionModalOpen();
		}
	}, [sessionDuration]);

	function startSession() {
		setSession({ goal: sessionGoal, target: sessionTarget });
		setDistractionFreeMode.toggle();
		if (sessionMusic) {
			setMusicPlaying.on();
		}
	}

	function endTimedSession(totalTime) {
		// Set total session duration in seconds
		setSessionDuration(() => totalTime);
		setSession(null);
		setDistractionFreeMode.toggle();
		if (sessionMusic) {
			setMusicPlaying.off();
		}
		if (authSession) {
			saveSession(totalTime);
		}
	}

	function endWordCountSession() {
		setSession(null);
		setDistractionFreeMode.toggle();
		if (sessionMusic) {
			setMusicPlaying.off();
		}
		onEndSessionModalOpen();
		if (authSession) {
			saveSession();
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		await router.push('/');
	}

	let sessionComponent = null;
	if (session && session?.goal === 'duration') {
		const time = new Date();
		time.setSeconds(time.getSeconds() + 60 * session?.target);
		sessionComponent = (
			<Timer
				endTimedSession={endTimedSession}
				expiry={time}
				music={sessionMusic}
				setMusicPlaying={setMusicPlaying}
				showEndOfSessionNotification={showEndOfSessionNotification}
				target={session?.target}
			/>
		);
	} else if (session && session?.goal === 'word-count') {
		sessionComponent = (
			<HStack align='center' justify='center' spacing={2}>
				<Tooltip label='End Session'>
					<IconButton
						aria-label='stop session timer'
						bg='transparent'
						p={0}
						size='xs'
						icon={<Square width={14} height={14} />}
						onClick={endWordCountSession}
					/>
				</Tooltip>
				<Text
					fontSize='sm'
					ml={2}
				>{`${wordCount} / ${sessionTarget}`}</Text>
			</HStack>
		);
	} else {
		sessionComponent = (
			<Popover placement='bottom-end'>
				<PopoverTrigger>
					<Button size='sm'>New Session</Button>
				</PopoverTrigger>
				<PopoverContent w='sm'>
					<PopoverArrow />
					<PopoverBody p={4}>
						<VStack w='full' spacing={4}>
							<FormControl
								d='grid'
								gridTemplateColumns='repeat(5, 1fr)'
							>
								<GridItem colSpan={3}>
									<FormLabel
										m={0}
										fontSize='md'
										htmlFor='session-goal'
									>
										Session Goal
									</FormLabel>
								</GridItem>
								<GridItem colSpan={2}>
									<RadioGroup
										defaultValue={sessionGoal}
										fontSize='sm'
										name='session-goal'
										onChange={(e) => setSessionGoal(e)}
									>
										<Stack spacing={2} direction='column'>
											<Radio value='duration'>
												<Text fontSize='sm'>
													Duration
												</Text>
											</Radio>
											<Radio value='word-count'>
												<Text fontSize='sm'>
													Word Count
												</Text>
											</Radio>
										</Stack>
									</RadioGroup>
								</GridItem>
							</FormControl>
							{sessionGoal === 'duration' ? (
								<FormControl
									d='grid'
									gridTemplateColumns='repeat(5, 1fr)'
								>
									<GridItem colSpan={3}>
										<FormLabel
											m={0}
											fontSize='md'
											htmlFor='session-duration'
										>
											Target
										</FormLabel>
									</GridItem>
									<GridItem colSpan={2}>
										<HStack spacing={2}>
											<Input
												name='session-duration'
												defaultValue={sessionTarget}
												onChange={(e) =>
													setSessionTarget(
														parseInt(
															e.target.value,
															10
														)
													)
												}
											/>
											<Text fontSize='sm'>minutes</Text>
										</HStack>
									</GridItem>
								</FormControl>
							) : (
								<FormControl
									d='grid'
									gridTemplateColumns='repeat(5, 1fr)'
								>
									<GridItem colSpan={3}>
										<FormLabel
											m={0}
											fontSize='md'
											htmlFor='session-duration'
										>
											Target
										</FormLabel>
									</GridItem>
									<GridItem colSpan={2}>
										<HStack spacing={2}>
											<Input
												name='session-word-count'
												defaultValue={sessionTarget}
												onChange={(e) =>
													setSessionTarget(
														parseInt(
															e.target.value,
															10
														)
													)
												}
											/>
											<Text fontSize='sm'>words</Text>
										</HStack>
									</GridItem>
								</FormControl>
							)}
							{sessionGoal === 'duration' ? (
								<FormControl
									d='grid'
									gridTemplateColumns='repeat(5, 1fr)'
								>
									<GridItem colSpan={3}>
										<FormLabel
											m={0}
											fontSize='md'
											htmlFor='end-of-session-notification'
										>
											Notify when session ends
										</FormLabel>
									</GridItem>
									<GridItem colSpan={2}>
										<Switch
											defaultChecked={false}
											id='end-of-session-notification'
											onChange={(e) =>
												setShowEndOfSessionNotification(
													e.target.checked
												)
											}
											checked={
												showEndOfSessionNotification
											}
										/>
									</GridItem>
								</FormControl>
							) : null}
							<FormControl
								d='grid'
								gridTemplateColumns='repeat(5, 1fr)'
							>
								<GridItem colSpan={3}>
									<FormLabel
										m={0}
										fontSize='md'
										htmlFor='session-music'
									>
										Music
									</FormLabel>
								</GridItem>
								<GridItem colSpan={2}>
									<Switch
										defaultChecked={false}
										id='session-music'
										onChange={(e) =>
											setSessionMusic(e.target.checked)
										}
										checked={sessionMusic}
									/>
								</GridItem>
							</FormControl>
							<HStack w='full' justifyContent='end' spacing={4}>
								<Button
									colorScheme='brand'
									onClick={startSession}
									size='sm'
								>
									Start
								</Button>
							</HStack>
						</VStack>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		);
	}

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
			<Grid w='full' h='full' templateColumns='repeat(3, 1fr)' gap={4}>
				{/* Logo */}
				<Flex
					align='center'
					justifyContent='start'
					fontSize='xl'
					fontWeight='bold'
					color={useColorModeValue('gray.900', 'white')}
					opacity={distractionFreeMode ? '0.1' : '1'}
					_hover={{ opacity: 1 }}
				>
					<NextLink href='/'>The Writing App</NextLink>
					<Tag ml={4}>Beta</Tag>
				</Flex>

				{/* Tools */}
				<HStack
					h='full'
					py={4}
					align='center'
					justifyContent='center'
					fontSize='xl'
					fontWeight='bold'
					color={useColorModeValue('gray.900', 'white')}
					opacity={distractionFreeMode ? '0.1' : '1'}
					_hover={{ opacity: 1 }}
				>
					{authSession ? (
						<HStack spacing={4}>
							<NextLink href='/'>
								<Button
									colorScheme={
										router?.pathname === '/' ? 'brand' : ''
									}
									size='sm'
									px={4}
									variant={
										router?.pathname !== '/'
											? 'ghost'
											: 'solid'
									}
								>
									<Edit3 width={14} height={14} />
									<Text fontSize='sm' ml={2}>
										Write
									</Text>
								</Button>
							</NextLink>

							<NextLink href='/dashboard'>
								<Button
									colorScheme={
										router?.pathname === '/dashboard'
											? 'brand'
											: ''
									}
									size='sm'
									px={4}
									variant={
										router?.pathname !== '/dashboard'
											? 'ghost'
											: 'solid'
									}
								>
									<MdOutlineSpaceDashboard
										width={14}
										height={14}
									/>
									<Text fontSize='sm' ml={2}>
										Dashboard
									</Text>
								</Button>
							</NextLink>

							{/*<NextLink href='/analytics'>*/}
							{/*	<Button size='sm' px={4} variant='ghost'>*/}
							{/*		<BarChart2 width={14} height={14} />*/}
							{/*		<Text fontSize='sm' ml={2}>Analytics</Text>*/}
							{/*		<Tag ml={2}>Coming Soon</Tag>*/}
							{/*	</Button>*/}
							{/*</NextLink>*/}
						</HStack>
					) : null}
				</HStack>

				{/* Settings & Account */}
				<HStack
					h='full'
					align='center'
					justifyContent='end'
					fontSize='xl'
					fontWeight='bold'
					color={useColorModeValue('gray.900', 'white')}
					spacing={4}
					opacity={distractionFreeMode ? '0.1' : '1'}
					_hover={{ opacity: 1 }}
				>
					{isSaving ? <Text fontSize='sm'>Saving...</Text> : null}

					{router?.pathname === '/' ? sessionComponent : null}

					{router?.pathname === '/' && !authSession ? (
						<>
							<Button
								w={10}
								h={10}
								p={0}
								rounded='md'
								d='flex'
								align='center'
								justify='center'
								onClick={setDistractionFreeMode.toggle}
								variant='ghost'
							>
								<Icon as={MdCenterFocusStrong} />
							</Button>

							<>
								<Button
									w={10}
									h={10}
									p={0}
									rounded='md'
									d='flex'
									align='center'
									justify='center'
									onClick={() => {
										if (!isEditorEmpty) {
											onOpen();
											downloadAsMarkdown();
										} else {
											toast({
												duration: 2000,
												position: 'top',
												status: 'info',
												title: 'No content to export',
											});
										}
									}}
									variant='ghost'
								>
									<Icon as={Download} />
								</Button>

								<Modal
									isCentered={true}
									isOpen={isOpen}
									onClose={onClose}
								>
									<ModalOverlay />
									<ModalContent px={6} py={8}>
										<ModalBody>
											<VStack
												align='center'
												justify='center'
												color={useColorModeValue(
													'gray.900',
													'white'
												)}
												textAlign='center'
												spacing={4}
											>
												<Flex
													w='full'
													alignItems='center'
													justifyContent='center'
												>
													<NextImage
														src='/images/star.png'
														width={128}
														height={128}
													/>
												</Flex>

												<Text
													fontSize='lg'
													fontWeight='semibold'
												>
													Markdown Generated!
												</Text>

												<Text>
													Thanks for using The Writing
													App! Feel free to reach out
													to me on{' '}
													<Link
														color='brand.200'
														href='https://twitter.com/_ilango'
														isExternal={true}
													>
														Twitter
													</Link>{' '}
													with any feedback.
												</Text>

												<Text>
													If you found this product
													helpful, consider writing a
													few words about us on
													Twitter!
												</Text>

												<a
													href='https://twitter.com/share?ref_src=twsrc%5Etfw'
													className='twitter-share-button'
													data-size='large'
													data-text='Writing in The Writing App is such a joy! 🤩 It helps me focus and be consistent with my writing habit. Try it for yourself 👇️'
													data-url='https://thewritingapp.opencatalysts.tech/'
													data-related='_ilango,opencatalysts'
													data-lang='en'
													data-dnt='true'
													data-show-count='false'
												>
													Share on Twitter
												</a>
												<Script src='https://platform.twitter.com/widgets.js' />
											</VStack>
										</ModalBody>
									</ModalContent>
								</Modal>
							</>

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
						</>
					) : null}

					{authSession ? (
						<Menu>
							<MenuButton
								as={Button}
								p={0}
								bg='transparent'
								_hover={{ bg: 'transparent' }}
								_active={{ bg: 'transparent' }}
								_focus={{ bg: 'transparent' }}
							>
								<Avatar
									icon={<User width={16} height={16} />}
									size='sm'
								/>
							</MenuButton>
							<MenuList p={0}>
								<MenuItem
									w='full'
									h={10}
									onClick={onAboutModalOpen}
								>
									<Text fontSize='sm'>About</Text>
								</MenuItem>
								<MenuItem d='none'>What&apos;s New</MenuItem>
								<MenuItem
									w='full'
									h={10}
									onClick={onSettingsModalOpen}
								>
									<Text fontSize='sm'>Settings</Text>
								</MenuItem>
								<MenuDivider m={0} />
								<MenuItem
									w='full'
									h={10}
									d='flex'
									alignItems='center'
									justifyContent='space-between'
								>
									<Text fontSize='sm'>Dark Mode</Text>
									<Switch
										defaultChecked={colorMode === 'dark'}
										onChange={toggleMode}
										size='sm'
									/>
								</MenuItem>
								<MenuDivider m={0} />
								<MenuItem w='full' h={10} onClick={signOut}>
									<Text fontSize='sm'>Sign Out</Text>
								</MenuItem>
							</MenuList>
						</Menu>
					) : (
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
					)}
				</HStack>
			</Grid>
			<Modal
				isCentered={true}
				isOpen={isAuthModalOpen}
				onClose={onAuthModalClose}
				size='5xl'
			>
				<ModalOverlay />
				<ModalContent>
					<ModalBody py={12}>
						<Grid gap={4} templateColumns='repeat(2, 1fr)'>
							<VStack
								h='full'
								alignItems='start'
								justifyContent='center'
								color={useColorModeValue('black', 'white')}
								px={8}
								spacing={8}
							>
								<Heading as='h2' fontSize='2xl'>
									By signing up, you can:
								</Heading>
								<List spacing={4}>
									<ListItem d='flex' alignItems='start'>
										<ListIcon
											as={MdCheckCircle}
											color='green.500'
											fontSize='xl'
											mt={1}
										/>
										<VStack alignItems='start'>
											<Heading as='h3' fontSize='xl'>
												Sync to the cloud
											</Heading>
											<Text fontSize='sm'>
												Save all your writing to the
												cloud and access them anywhere
											</Text>
										</VStack>
									</ListItem>
									<ListItem d='flex' alignItems='start'>
										<ListIcon
											as={MdCheckCircle}
											color='green.500'
											fontSize='xl'
											mt={1}
										/>
										<VStack alignItems='start'>
											<Heading as='h3' fontSize='xl'>
												Track your writing goals
											</Heading>
											<Text fontSize='sm'>
												Get detailed analytics from your
												writing sessions and stay
												consistent
											</Text>
										</VStack>
									</ListItem>
									<ListItem d='flex' alignItems='start'>
										<ListIcon
											as={MdCheckCircle}
											color='green.500'
											fontSize='xl'
											mt={1}
										/>
										<VStack alignItems='start'>
											<Heading as='h3' fontSize='xl'>
												Shareable Links
											</Heading>
											<Text fontSize='sm'>
												Get shareable links to your
												posts and get feedback from your
												peers.
											</Text>
										</VStack>
									</ListItem>
									<ListItem d='flex' alignItems='start'>
										<ListIcon
											as={MdCheckCircle}
											color='green.500'
											fontSize='xl'
											mt={1}
										/>
										<VStack alignItems='start'>
											<Heading as='h3' fontSize='xl'>
												And more...
											</Heading>
											<Text fontSize='sm'>
												I&apos;m constantly adding
												features that help you become a
												better writer.
											</Text>
										</VStack>
									</ListItem>
								</List>
							</VStack>
							<VStack px={8} spacing={8}>
								<Flex
									w='full'
									alignItems='center'
									justifyContent='center'
								>
									<NextImage
										src='/images/shield.png'
										width={96}
										height={96}
									/>
								</Flex>
								<AuthBasic />
							</VStack>
						</Grid>
					</ModalBody>
				</ModalContent>
			</Modal>
			<Modal
				isCentered={true}
				isOpen={isSettingsModalOpen}
				onClose={onSettingsModalClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalBody py={6}>
						<Settings />
					</ModalBody>
				</ModalContent>
			</Modal>
			<Modal
				isCentered={true}
				isOpen={isAboutModalOpen}
				onClose={onAboutModalClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody py={6}>
						<VStack
							align='center'
							justify='center'
							color={useColorModeValue('gray.900', 'white')}
							textAlign='center'
							spacing={4}
						>
							<Flex
								w='full'
								alignItems='center'
								justifyContent='center'
							>
								<NextImage
									src='/images/about.png'
									width={128}
									height={128}
								/>
							</Flex>

							<Text fontSize='lg' fontWeight='semibold'>
								About The Writing App
							</Text>

							<Text textAlign='left'>
								TWA was born out of a requirement for a writing
								app that suited my needs. After trying many
								writing apps — code editors to note taking app —
								none of them help with maintaining a writing
								habit. Some of them have a poor writing
								experience by doing too much stuff.
							</Text>

							<Text textAlign='left'>
								I wanted a simple writing app that has the
								features for building a writing habit while
								having an enjoyable writing experience. While
								the current state only supports single posts
								suited for articles, I want to support more
								use-cases like book writing, daily journals, and
								more.
							</Text>

							<Text textAlign='left'>
								TWA is heavily inspired by{' '}
								<Link
									color='brand.200'
									href='https://blurt.app'
									isExternal={true}
								>
									Blurt
								</Link>
								. It had everything I needed but unfortunately
								it got acquired and is no longer accessible to
								the public. I want to avoid that for TWA. TWA
								will never be acquired. To make that possible,
								I&apos;ll eventually start charging a
								subscription fee for usage.
							</Text>

							<Text textAlign='left'>
								But there are a lot of things that are out of my
								control that might affect my running of TWA. So,
								to prevent any disruption to users, I&apos;m
								making the entire source-code available to the
								public on Github. With a little technical
								know-how, you can host TWA anywhere you like.
							</Text>

							<Text textAlign='left'>
								If you think this is something you&apos;d be
								interested in, follow me on{' '}
								<Link
									color='brand.200'
									href='https://twitter.com/_ilango'
									isExternal={true}
								>
									Twitter
								</Link>
								. Feel free to drop a DM and ask me anything
								about TWA.
							</Text>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
			<Modal
				isCentered={true}
				isOpen={isEndSessionModalOpen}
				onClose={onEndSessionModalClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody py={6}>
						<VStack
							align='center'
							justify='center'
							color={useColorModeValue('gray.900', 'white')}
							textAlign='center'
							spacing={4}
						>
							<Flex
								w='full'
								alignItems='center'
								justifyContent='center'
							>
								<NextImage
									src='/images/medal.png'
									width={128}
									height={128}
								/>
							</Flex>

							<Text fontSize='lg' fontWeight='semibold'>
								Great Session!
							</Text>

							<Text textAlign='center'>
								{sessionGoal === 'duration'
									? `You wrote for ${(
											sessionDuration / 60
									  ).toFixed(
											0
									  )} minutes out of your target ${sessionTarget} minutes! Keep it up!`
									: `You wrote ${wordCount} out of your target ${sessionTarget} words. Keep it up!`}
							</Text>

							<a
								href='https://twitter.com/share?ref_src=twsrc%5Etfw'
								className='twitter-share-button'
								data-size='large'
								data-text="I just finished a great writing session on The Writing App! It's a great app to do focused writing. Try it here: 👇️"
								data-url='https://thewritingapp.opencatalysts.tech/'
								data-related='_ilango,opencatalysts'
								data-lang='en'
								data-dnt='true'
								data-show-count='false'
							>
								Share on Twitter
							</a>
							<Script src='https://platform.twitter.com/widgets.js' />
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	);
}
