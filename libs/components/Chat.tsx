import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar } from '@apollo/client';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!socket) return;

		socket.onmessage = (msg) => {
			const data = JSON.parse(msg.data);

			switch (data.event) {
				case 'info':
					setOnlineUsers(data.totalClients);
					break;
				case 'getMessage':
					setMessagesList(data.list);
					break;
				case 'message':
					setMessagesList((prev) => [...prev, data]);
					break;
			}
		};
	}, [socket]);

	useEffect(() => {
		const timeoutId = setTimeout(() => setOpenButton(true), 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageInput(e.target.value);
	}, []);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	};

	const sendMessage = () => {
		if (!messageInput.trim()) {
			sweetErrorAlert(Messages.error4);
			return;
		}

		if (socket) {
			socket.send(
				JSON.stringify({
					event: 'message',
					data: messageInput,
				}),
			);
			setMessageInput('');
		}
	};

	const getMemberImage = (memberData: Member | null): string => {
		return memberData?.memberImage ? `${REACT_APP_API_URL}/${memberData.memberImage}` : '/img/profile/defaultUser.svg';
	};

	return (
		<Stack className="chatting">
			{openButton && (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			)}

			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className="chat-top" component="div">
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
				</Box>

				<Box className="chat-content" id="chat-content" ref={chatContentRef} component="div">
					<ScrollableFeed>
						<Stack className="chat-main">
							<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
								<div className="welcome">Welcome to Live chat!</div>
							</Box>

							{messagesList.map((message: MessagePayload, index: number) => {
								const { text, memberData } = message;
								const isOwnMessage = memberData?._id === user?._id;
								const memberImage = getMemberImage(memberData);

								return isOwnMessage ? (
									<Box
										key={index}
										component="div"
										flexDirection="row"
										style={{ display: 'flex' }}
										alignItems="flex-end"
										justifyContent="flex-end"
										sx={{ m: '10px 0px' }}
									>
										<div className="msg-right">{text}</div>
									</Box>
								) : (
									<Box key={index} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
										<Avatar alt={memberData?.memberNick || 'User'} src={memberImage} />
										<div className="msg-left">{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>

				<Box className="chat-bott" component="div">
					<input
						type="text"
						name="message"
						className="msg-input"
						placeholder="Type message"
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className="send-msg-btn" onClick={sendMessage}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;