export enum Provider {
	Google = 'google',
	Kakao = 'kakao',
}

export type validateNickRes = {
	status: boolean;
	detail?: validateNickResType;
}

export type validateNickResType = "DUPLICATED" | "BAD_WORDS";

export type updateNickRes = validateNickRes & {
	newNick?: string;
}