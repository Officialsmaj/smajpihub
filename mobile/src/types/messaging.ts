export type Conversation={_id:string;participantName?:string;profileImage?:string;productTitle?:string;lastMessage?:string;updatedAt?:string;unreadBy?:string[];archived?:boolean;online?:boolean;typing?:boolean};
export type Message={_id:string;senderId:string;message:string;messageType?:string;createdAt?:string;readAt?:string};
export type NotificationItem={_id:string;title?:string;message?:string;type?:string;relatedId?:string;read?:boolean;createdAt?:string};
