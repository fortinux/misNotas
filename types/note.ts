export interface TextNote {
  id: string;
  type: 'text';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceNote {
  id: string;
  type: 'voice';
  title: string;
  audioUri: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export type Note = TextNote | VoiceNote;