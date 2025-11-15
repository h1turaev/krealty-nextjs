import { NotificationGroup, NotificationStatus, NotificationType } from './notification';

interface NotificationSearch {
	notificationStatus?: NotificationStatus;
	notificationType?: NotificationType;
	notificationGroup?: NotificationGroup;
}

export interface NotificationInquiry {
	page: number;
	limit: number;
	search: NotificationSearch;
}

export interface NotificationInput {
	notificationType: NotificationType;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string; // Backend uses notificationDesc
	receiverId: string; // Receiver (backend uses receiverId instead of memberId)
	propertyId?: string; // Related property
	articleId?: string; // Related article
	// authorId is automatically set from authenticated user in backend
}
