import {
	Button,
	FormControl,
	FormLabel,
	Heading,
	Icon,
	Input,
	InputGroup,
	InputRightElement,
	VStack,
	useColorModeValue,
	useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { checkUsername, fetchUserProfile, saveUserProfile } from '../lib/utils';
import { useSession } from 'next-auth/react';
import debounce from 'lodash.debounce';
import { Check } from 'react-feather';

export default function Settings(props) {
	const { user: authenticatedUser } = props;
	const { data: authSession } = useSession();
	const [profile, setProfile] = useState(null);
	const [name, setName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [dailyGoal, setDailyGoal] = useState(300);
	const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
	const toast = useToast();

	useEffect(() => {
		async function fetchProfile() {
			const { user } = await fetchUserProfile(authenticatedUser?.id);
			setProfile(user);
			setName(user?.name);
			setEmail(user?.email);
			setUsername(user?.username);
			setDailyGoal(user?.dailyGoal);
		}

		fetchProfile().then(() => console.log('Profile fetched...'));
	}, [authSession]);

	async function saveProfile() {
		setIsSaving(true);
		const update = {
			name,
			email,
			username,
			dailyGoal,
		};
		await saveUserProfile(profile, update);
		toast({
			duration: 2000,
			position: 'top',
			status: 'success',
			title: 'Profile saved',
		});
		setIsSaving(false);
	}

	const debounced = debounce(async function () {
		setIsUsernameAvailable(false);
		setIsCheckingAvailability(true);
		const { available } = await checkUsername(username);
		if (available) {
			setIsUsernameAvailable(true);
		}
		setIsCheckingAvailability(false);
	}, 1500);

	return (
		<VStack
			color={useColorModeValue('black', 'white')}
			alignItems='start'
			spacing={8}
		>
			<Heading as='h2' fontSize='2xl'>
				Profile Settings
			</Heading>
			<VStack w='full' spacing={4} mb={4}>
				<FormControl>
					<FormLabel>Name</FormLabel>
					<Input
						name='name'
						type='text'
						w='full'
						h={12}
						onChange={(e) => setName(e.target.value)}
						value={name}
					/>
				</FormControl>
				<FormControl>
					<FormLabel>Username</FormLabel>
					<InputGroup>
						<Input
							name='username'
							type='text'
							w='full'
							h={12}
							onChange={(e) => setUsername(e.target.value)}
							onKeyUp={debounced}
							value={username}
						/>
						<InputRightElement h='full'>
							{isUsernameAvailable ? (
								<Button h='full' variant='ghost'>
									<Icon as={Check} color='green.200' />
								</Button>
							) : (
								<Button
									h='full'
									isLoading={isCheckingAvailability}
									variant='ghost'
								/>
							)}
						</InputRightElement>
					</InputGroup>
				</FormControl>
				<FormControl>
					<FormLabel>Email Address</FormLabel>
					<Input
						name='email'
						type='text'
						w='full'
						h={12}
						onChange={(e) => setEmail(e.target.value)}
						value={email}
					/>
				</FormControl>
				<FormControl>
					<FormLabel>Daily Word Count Goal</FormLabel>
					<Input
						name='dailyGoal'
						type='text'
						w='full'
						h={12}
						onChange={(e) =>
							setDailyGoal(parseInt(e.target.value, 10))
						}
						value={dailyGoal}
					/>
				</FormControl>
			</VStack>
			<FormControl>
				<Button
					aria-label='Save profile'
					w='full'
					colorScheme='brand'
					size='lg'
					onClick={saveProfile}
					isLoading={isSaving}
				>
					{isSaving ? 'Saving...' : 'Save'}
				</Button>
			</FormControl>
		</VStack>
	);
}
