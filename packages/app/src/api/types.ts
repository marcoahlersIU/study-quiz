import { SelectableIcon } from '@/components/IconSelect';

export interface DirectusRole {
  /** Unique identifier for the role. */
  id: string;
  /** Name of the role. */
  name: string;
  /** The role's icon. */
  icon: string;
  /** Description of the role. */
  description: string | null;
  /** Array of IP addresses that are allowed to connect to the API as a user of this role. */
  ip_access: string[];
  /** Whether or not this role enforces the use of 2FA. */
  enforce_tfa: boolean;
  /** Admin role. If true, skips all permission checks. */
  admin_access: boolean;
  /** The users in the role are allowed to use the app. */
  app_access: boolean;
  users: string | DirectusUser[];
}

export interface DirectusFolder {
  /** Unique identifier for the folder. */
  id: string;
  /** Name of the folder. */
  name: string;
  /** Unique identifier of the parent folder. This allows for nested folders. */
  parent: string | null | DirectusFolder;
}

export interface DirectusFile {
  /** Unique identifier for the file. */
  id: string;
  /** Where the file is stored. Either `local` for the local filesystem or the name of the storage adapter (for example `s3`). */
  storage: string;
  /** Name of the file on disk. By default, Directus uses a random hash for the filename. */
  filename_disk: string | null;
  /** How you want to the file to be named when it's being downloaded. */
  filename_download: string;
  /** Title for the file. Is extracted from the filename on upload, but can be edited by the user. */
  title: string | null;
  /** MIME type of the file. */
  type: string | null;
  /** Virtual folder where this file resides in. */
  folder: string | null | DirectusFolder;
  /** Who uploaded the file. */
  uploaded_by: string | DirectusUser | null;
  /** When the file was uploaded. */
  uploaded_on: string;
  modified_by: string | null | DirectusUser;
  modified_on: string;
  /** Character set of the file. */
  charset: string | null;
  /** Size of the file in bytes. */
  filesize: string | null;
  /** Width of the file in pixels. Only applies to images. */
  width: number | null;
  /** Height of the file in pixels. Only applies to images. */
  height: number | null;
  /** Duration of the file in seconds. Only applies to audio and video. */
  duration: number | null;
  /** Where the file was embedded from. */
  embed: string | null;
  /** Description for the file. */
  description: string | null;
  /** Where the file was created. Is automatically populated based on EXIF data for images. */
  location: string | null;
  /** Tags for the file. Is automatically populated based on EXIF data for images. */
  tags: string[] | null;
  /** IPTC, EXIF, and ICC metadata extracted from file */
  metadata: { [key: string]: any } | null;
  topic: string | null;
  preview_image: string | null | DirectusFile;
  pageCount: number | null;

  uploading?: boolean;
}

export interface TopicShare {
  id: string;
  date_created: string | null;
  user: string | DirectusUser;
  topic: string | Topic;
}
export interface DirectusUser {
  /** Unique identifier for the user. */
  id: string;
  /** First name of the user. */
  first_name: string;
  /** Last name of the user. */
  last_name: string;
  /** Unique email address for the user. */
  email: string;
  /** Password of the user. */
  password: string;
  /** The user's location. */
  location: string | null;
  /** The user's title. */
  title: string | null;
  /** The user's description. */
  description: string | null;
  /** The user's tags. */
  tags: string[] | null;
  /** The user's avatar. */
  avatar: string | null | DirectusFile;
  /** The user's language used in Directus. */
  language: string;
  /** What theme the user is using. */
  theme: 'light' | 'dark' | 'auto';
  /** The 2FA secret string that's used to generate one time passwords. */
  tfa_secret: string | null;
  /** Status of the user. */
  status: 'active' | 'invited' | 'draft' | 'suspended' | 'deleted';
  /** Unique identifier of the role of this user. */
  role: string | DirectusRole;
  /** Static token for the user. */
  token: string | null;
  last_access: string | null;
  /** Last page that the user was on. */
  last_page: string | null;
  provider: string;
  external_identifier: string | null;
  auth_data: { [key: string]: any } | null;
  email_notifications: boolean | null;
  preferences_divider: string;
  admin_divider: string;

  shared_topics: undefined | string[] | TopicShare[];
  topics: undefined | string[] | Topic[];
  last_ping: null | string;
}

export interface Topic {
  id: string;
  sort: number | null;
  date_created: string | null;
  user_created: string | DirectusUser;
  title: string;
  icon: SelectableIcon | null;
}

export interface Question {
  id: string;
  sort: number | null;
  date_created: string | null;
  user_created: string | DirectusUser;
  user_updated: string | DirectusUser;
  date_updated: string | null;
  topic: string | Topic;
  content: string;
  answers: Answer[];
}

export interface Answer {
  id: string;
  sort: number | null;
  date_created: string | null;
  user_created: string | DirectusUser;
  user_updated: string | DirectusUser;
  date_updated: string | null;
  topic: string | Topic;
  question: string | Question;
  content: string;
  correct_answer: boolean;
  reason: string | null;
}

export interface Exercise {
  id: string;
  date_created: string | null;
  user_created: string | DirectusUser;
  topic: string | Topic;
  status: 'init' | 'started' | 'finished';
  current_exercise_question: null | string | ExerciseQuestion;
  participants: undefined | ExerciseParticipant[];
}

export interface ExerciseQuestion extends Question {
  exercise: string | Exercise;
  question: string | Question;
  exercise_question_answers: undefined | string[] | ExerciseAnswer[];
  show_result: boolean;
  answer_end_time: null | string;
}

export interface ExerciseAnswer extends Answer {
  exercise: string | Exercise;
  quesiton: undefined;
  exercise_question: string | ExerciseQuestion;
}

export interface ExerciseParticipant {
  id: string;
  topic: string | Topic;
  exercise: string | Exercise;
  user: string | DirectusUser;
  status: 'invited' | 'accepted' | 'rejected';
}

export interface ExerciseParticipantAnswer {
  id: string;
  topic: string | Topic;
  exercise: string | Exercise;
  exercise_question: string | ExerciseQuestion;
  participant: string | ExerciseParticipant;
  selected_exercise_answer: string | null | ExerciseAnswer;
}

export type Schema = {
  directus_users: DirectusUser[];
  topics: Topic[];
  topic_shared: TopicShare[];
  questions: Question[];
  answers: Answer[];
  exercises: Exercise[];
  exercise_questions: ExerciseQuestion[];
  exercise_answers: ExerciseAnswer[];
  exercise_participants: ExerciseParticipant[];
  exercise_participant_answers: ExerciseParticipantAnswer[];
};
