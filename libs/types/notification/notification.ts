import { Member } from '../member/member';
import { Property } from '../property/property';

export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	PROPERTY = 'PROPERTY',
	INQUIRY = 'INQUIRY',
}

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
}

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string; // Backend uses notificationDesc instead of notificationMessage
	authorId: string; // Who performed the action (e.g., agent who created property)
	receiverId: string; // Notification receiver
	propertyId?: string; // Related property if applicable
	articleId?: string; // Related article if applicable
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	authorData?: Member; // Author/action performer member data
	propertyData?: Property; // Related property data
}

export interface Notifications {
	list: Notification[];
	metaCounter: {
		total: number;
		unread: number;
	}[];
}
