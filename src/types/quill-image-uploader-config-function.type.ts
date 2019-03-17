import { UploadedImageElementWrapper } from "src/uploaded-image-blot";

export type UploadHandlerFunction = (uploadWrapper: UploadedImageElementWrapper) => Promise<string>;
export type BeforeUploadHandlerFunction = (file: File) => void;
export type OnFinishFunction = (url: string) => void;
export type OnErrorFunction = (error: Error) => void;
